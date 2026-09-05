from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import uuid
import datetime

try:
    from backend.database import get_db
    from backend.models import (
        Warehouse, Inventory, Quotation, QuoteItem, FulfillmentSplit,
        FulfillmentOrder, Backorder, AuditLog
    )
    from backend.services.fulfillment import OrderFulfillmentEngine
except ImportError:
    from database import get_db
    from models import (
        Warehouse, Inventory, Quotation, QuoteItem, FulfillmentSplit,
        FulfillmentOrder, Backorder, AuditLog
    )
    from services.fulfillment import OrderFulfillmentEngine

router = APIRouter(prefix="/warehouses", tags=["Fulfillment & Warehouses"])

# Additional routers to handle /api/fulfillment and /api/inventory prefixes
fulfillment_router = APIRouter(prefix="/fulfillment", tags=["Fulfillment & Warehouses"])
inventory_router = APIRouter(prefix="/inventory", tags=["Fulfillment & Warehouses"])


class ConfirmFulfillmentPayload(BaseModel):
    custom_split: Optional[List[Dict[str, Any]]] = None
    use_auto_split: bool = True


class ReceiveInventoryPayload(BaseModel):
    product_id: str
    warehouse_id: str
    qty_received: int


@router.get("/")
def list_warehouses(db: Session = Depends(get_db)):
    warehouses = db.query(Warehouse).all()
    results = []
    for wh in warehouses:
        inv = db.query(Inventory).filter(Inventory.warehouse_id == wh.id).all()
        total_items = sum(i.quantity_on_hand for i in inv)
        results.append({
            "id": wh.id,
            "name": wh.name,
            "code": wh.code,
            "location": wh.location,
            "shipping_cost_weight": float(wh.shipping_cost_weight),
            "total_items": total_items
        })
    return results


@router.get("/split-recommendation/{quote_id}")
@fulfillment_router.get("/{quote_id}/recommendation")
def get_fulfillment_split_recommendation(quote_id: str, db: Session = Depends(get_db)):
    """
    GET /api/fulfillment/{quotation_id}/recommendation
    Runs the auto-split algorithm and returns suggested warehouse allocation,
    estimated shipment count, total shipping cost, and backorder warnings.
    """
    engine = OrderFulfillmentEngine(db)
    try:
        recommendation = engine.calculate_optimal_split(quote_id, db)
        return recommendation
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate fulfillment recommendation: {str(e)}")


@router.post("/confirm/{quote_id}")
@fulfillment_router.post("/{quote_id}/confirm")
def confirm_fulfillment_split(
    quote_id: str,
    payload: ConfirmFulfillmentPayload = Body(...),
    db: Session = Depends(get_db)
):
    """
    POST /api/fulfillment/{quotation_id}/confirm
    Accepts either the auto-suggested split or a manual override.
    Uses strict database transaction integrity to deduct inventory, create
    FulfillmentOrder & FulfillmentSplit records, and generate Backorder records if needed.
    """
    engine = OrderFulfillmentEngine(db)

    try:
        # Determine split payload: manual override or auto-calculated
        if payload.custom_split and len(payload.custom_split) > 0 and not payload.use_auto_split:
            split_result = engine.apply_manual_split(quote_id, payload.custom_split, db)
        else:
            split_result = engine.calculate_optimal_split(quote_id, db)

        # Begin strict transactional database write
        # 1. Create FulfillmentOrder record
        fo_id = f"fo-{uuid.uuid4().hex[:6]}"
        has_bo = len(split_result.get("backorders", [])) > 0
        fo_status = "PARTIAL" if has_bo else "FULFILLED"

        ful_order = FulfillmentOrder(
            id=fo_id,
            quotation_id=quote_id,
            status=fo_status,
            total_shipments=split_result.get("estimated_shipment_count", 1),
            total_shipping_cost=split_result.get("total_shipping_cost", 0.0)
        )
        db.add(ful_order)

        # 2. Process FulfillmentSplits and Deduct Inventory
        created_splits = []
        for s in split_result.get("fulfillment_splits", []):
            wh_id = s.get("warehouse_id")
            p_id = s.get("product_id")
            alloc_qty = int(s.get("allocated_qty", s.get("quantity_fulfilled", 0)))

            split_obj = FulfillmentSplit(
                id=f"fs-{uuid.uuid4().hex[:6]}",
                fulfillment_order_id=fo_id,
                quotation_id=quote_id,
                warehouse_id=wh_id,
                warehouse_name=s.get("warehouse_name", "Warehouse"),
                product_id=p_id,
                product_name=s.get("product_name", "Product"),
                quantity_fulfilled=alloc_qty,
                shipment_count=1,
                shipping_cost=s.get("shipping_cost", 0.0),
                status="Allocated"
            )
            db.add(split_obj)
            created_splits.append(split_obj)

            # Deduct inventory atomically
            inv = db.query(Inventory).filter(
                Inventory.warehouse_id == wh_id,
                Inventory.product_id == p_id
            ).first()

            if inv:
                if inv.quantity_on_hand < alloc_qty:
                    raise ValueError(f"Insufficient stock at warehouse {wh_id} for product {p_id}")
                inv.quantity_on_hand -= alloc_qty
                if inv.quantity_reserved and inv.quantity_reserved >= alloc_qty:
                    inv.quantity_reserved -= alloc_qty

        # 3. Create Backorder records if necessary
        created_backorders = []
        for bo in split_result.get("backorders", []):
            bo_obj = Backorder(
                id=f"bo-{uuid.uuid4().hex[:6]}",
                quotation_id=quote_id,
                fulfillment_order_id=fo_id,
                product_id=bo.get("product_id"),
                product_name=bo.get("product_name"),
                missing_qty=bo.get("missing_qty", bo.get("backorder_quantity", 1)),
                status="WAITING"
            )
            db.add(bo_obj)
            created_backorders.append(bo_obj)

        # 4. Update Quotation Status
        quote = db.query(Quotation).filter(Quotation.id == quote_id).first()
        if quote:
            quote.status = "FULFILLMENT" if not has_bo else "PARTIAL_FULFILLMENT"

        # 5. Write Immutable Audit Log
        now_dt = datetime.datetime.utcnow()
        db.add(AuditLog(
            id=f"log-{uuid.uuid4().hex[:6]}",
            quotation_id=quote_id,
            user_id="Operations User",
            action="CONFIRM_FULFILLMENT",
            previous_stage=quote.status if quote else "FULFILLMENT",
            new_stage=quote.status if quote else "FULFILLMENT",
            rationale_note=f"Fulfillment confirmed across {split_result.get('estimated_shipment_count')} shipments.",
            entity_type="FulfillmentOrder",
            entity_id=fo_id,
            performed_by="Operations",
            details=f"Fulfillment order {fo_id} created with {len(created_splits)} split line(s) and {len(created_backorders)} backorder(s).",
            created_at=now_dt,
            timestamp=now_dt
        ))

        # Commit transaction
        db.commit()

        return {
            "message": f"Fulfillment order {fo_id} confirmed and inventory deducted.",
            "fulfillment_order_id": fo_id,
            "quotation_id": quote_id,
            "status": fo_status,
            "total_shipments": split_result.get("estimated_shipment_count", 1),
            "total_shipping_cost": split_result.get("total_shipping_cost", 0.0),
            "splits_count": len(created_splits),
            "backorders_count": len(created_backorders)
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Fulfillment confirmation failed (transaction rolled back): {str(e)}")


@router.post("/inventory/receive")
@inventory_router.post("/receive")
def receive_inventory_endpoint(
    payload: ReceiveInventoryPayload = Body(...),
    db: Session = Depends(get_db)
):
    """
    POST /api/inventory/receive
    Simulates stock arrival at a warehouse, updates Inventory on-hand,
    and returns any triggered backorder consolidations for UI prompt.
    """
    engine = OrderFulfillmentEngine(db)
    try:
        res = engine.process_new_inventory(
            product_id=payload.product_id,
            warehouse_id=payload.warehouse_id,
            qty_received=payload.qty_received,
            db=db
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process inventory arrival: {str(e)}")

