"""
DealFlow360 Multi-Warehouse Fulfillment & Auto-Split Engine

Features:
1. OrderFulfillmentEngine:
   - Single-Source Optimization: Checks if a single warehouse can fulfill the entire order (minimizes shipment count).
   - Multi-Source Split: Sorts warehouses by available_qty (descending) and shipping_cost_weight (ascending), allocating greedily.
   - Backorder Detection: Identifies inventory shortfalls across network and creates WAITING backorders.
2. Manual Override & Validation:
   - Validates custom user allocations against real-time DB inventory (allocated_qty <= available_qty).
3. Inventory Arrival & Backorder Consolidation:
   - Updates stock on inventory arrival and triggers Consolidation payload for WAITING backorders.
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
import uuid
import datetime

class OrderFulfillmentEngine:
    """
    Core engine handling optimal warehouse fulfillment routing, manual override validation,
    inventory deductions, and backorder consolidation triggers.
    """

    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def calculate_optimal_split(self, quotation_id: str, db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Calculates optimal multi-warehouse split:
        1. Single-Source Optimization: Attempt to fulfill entire order from 1 warehouse.
        2. Multi-Source Split: Sort by available_qty (desc) + shipping_cost_weight (asc).
        3. Backorder Detection: Record missing quantity if total network inventory < required quantity.
        """
        active_db = db or self.db
        if not active_db:
            raise ValueError("Database session required for calculate_optimal_split")

        try:
            from backend.models import Quotation, QuoteItem, Warehouse, Inventory, Product
        except ImportError:
            from models import Quotation, QuoteItem, Warehouse, Inventory, Product

        quote = active_db.query(Quotation).filter(Quotation.id == quotation_id).first()
        if not quote:
            raise ValueError(f"Quotation {quotation_id} not found")

        items = active_db.query(QuoteItem).filter(QuoteItem.quotation_id == quotation_id).all()
        warehouses = active_db.query(Warehouse).all()

        if not items:
            return {
                "quotation_id": quotation_id,
                "fulfillment_splits": [],
                "backorders": [],
                "total_shipping_cost": 0.0,
                "estimated_shipment_count": 0,
                "is_single_source": False,
                "has_backorders": False
            }

        # Build warehouse metadata dict
        wh_map = {
            w.id: {
                "id": w.id,
                "name": w.name,
                "code": getattr(w, "code", w.id),
                "location": w.location,
                "shipping_cost_weight": float(w.shipping_cost_weight or 1.0)
            }
            for w in warehouses
        }

        # Build live inventory lookup dict: (warehouse_id, product_id) -> available_qty
        inv_records = active_db.query(Inventory).all()
        stock_lookup = {}
        for inv in inv_records:
            avail = max(0, (inv.quantity_on_hand or 0) - (inv.quantity_reserved or 0))
            stock_lookup[(inv.warehouse_id, inv.product_id)] = avail

        # -----------------------------------------------------------------------
        # Step 1: Single-Source Optimization Check
        # -----------------------------------------------------------------------
        single_source_wh_id = None
        for wh in warehouses:
            can_fulfill_all = True
            for item in items:
                req_qty = int(item.quantity or 1)
                avail = stock_lookup.get((wh.id, item.product_id), 0)
                if avail < req_qty:
                    can_fulfill_all = False
                    break
            if can_fulfill_all:
                single_source_wh_id = wh.id
                break

        fulfillment_splits = []
        backorders = []
        used_warehouse_ids = set()
        total_shipping_cost = 0.0

        if single_source_wh_id:
            # Fulfill 100% of order from this single warehouse
            swh = wh_map[single_source_wh_id]
            for item in items:
                req_qty = int(item.quantity or 1)
                cost = round(req_qty * 45.0 * swh["shipping_cost_weight"], 2)
                total_shipping_cost += cost
                used_warehouse_ids.add(single_source_wh_id)

                fulfillment_splits.append({
                    "warehouse_id": single_source_wh_id,
                    "warehouse_name": swh["name"],
                    "location": swh["location"],
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "allocated_qty": req_qty,
                    "quantity_fulfilled": req_qty,
                    "shipping_cost": cost,
                    "status": "Allocated",
                    "allocation_strategy": "Single-Source Optimal"
                })

            return {
                "quotation_id": quotation_id,
                "quote_number": quote.quote_number,
                "fulfillment_splits": fulfillment_splits,
                "backorders": [],
                "total_shipping_cost": round(total_shipping_cost, 2),
                "estimated_shipment_count": 1,
                "is_single_source": True,
                "has_backorders": False,
                "optimization_note": f"Single-source optimization succeeded! Fully fulfilled from {swh['name']} in 1 shipment."
            }

        # -----------------------------------------------------------------------
        # Step 2: Multi-Source Greedy Split Algorithm
        # -----------------------------------------------------------------------
        for item in items:
            req_qty = int(item.quantity or 1)
            p_id = item.product_id
            p_name = item.product_name
            remaining_qty = req_qty

            # Gather all warehouses with stock for this product
            candidate_warehouses = []
            for wh_id, swh in wh_map.items():
                avail_qty = stock_lookup.get((wh_id, p_id), 0)
                if avail_qty > 0:
                    candidate_warehouses.append({
                        "id": wh_id,
                        "name": swh["name"],
                        "location": swh["location"],
                        "available_qty": avail_qty,
                        "weight": swh["shipping_cost_weight"]
                    })

            # Sort candidate warehouses: available_qty DESC, shipping_cost_weight ASC
            candidate_warehouses.sort(key=lambda x: (-x["available_qty"], x["weight"]))

            # Greedily allocate stock
            for c_wh in candidate_warehouses:
                if remaining_qty <= 0:
                    break

                alloc = min(remaining_qty, c_wh["available_qty"])
                remaining_qty -= alloc
                cost = round(alloc * 45.0 * c_wh["weight"], 2)
                total_shipping_cost += cost
                used_warehouse_ids.add(c_wh["id"])

                fulfillment_splits.append({
                    "warehouse_id": c_wh["id"],
                    "warehouse_name": c_wh["name"],
                    "location": c_wh["location"],
                    "product_id": p_id,
                    "product_name": p_name,
                    "allocated_qty": alloc,
                    "quantity_fulfilled": alloc,
                    "shipping_cost": cost,
                    "status": "Allocated",
                    "allocation_strategy": "Greedy Multi-Source Split"
                })

            # -----------------------------------------------------------------------
            # Step 3: Backorder Detection
            # -----------------------------------------------------------------------
            if remaining_qty > 0:
                backorders.append({
                    "product_id": p_id,
                    "product_name": p_name,
                    "missing_qty": remaining_qty,
                    "status": "WAITING"
                })

        estimated_shipment_count = len(used_warehouse_ids)

        return {
            "quotation_id": quotation_id,
            "quote_number": quote.quote_number,
            "fulfillment_splits": fulfillment_splits,
            "backorders": backorders,
            "total_shipping_cost": round(total_shipping_cost, 2),
            "estimated_shipment_count": estimated_shipment_count,
            "is_single_source": False,
            "has_backorders": len(backorders) > 0,
            "optimization_note": f"Multi-source split calculated across {estimated_shipment_count} warehouse(s)."
        }

    def apply_manual_split(
        self, quotation_id: str, custom_split_payload: List[Dict[str, Any]], db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Validates custom user allocations against real-time database stock:
        - Ensures allocated_qty <= available_qty for each warehouse.
        - Raises ValueError detailing stock violations if exceeded.
        """
        active_db = db or self.db
        if not active_db:
            raise ValueError("Database session required for apply_manual_split")

        try:
            from backend.models import Warehouse, Inventory, Quotation, QuoteItem
        except ImportError:
            from models import Warehouse, Inventory, Quotation, QuoteItem

        warehouses = active_db.query(Warehouse).all()
        wh_map = {w.id: w for w in warehouses}

        validated_splits = []
        total_shipping_cost = 0.0
        used_warehouse_ids = set()

        for split in custom_split_payload:
            wh_id = split.get("warehouse_id")
            p_id = split.get("product_id")
            alloc_qty = int(split.get("allocated_qty", 0))

            if alloc_qty <= 0:
                continue

            inv = active_db.query(Inventory).filter(
                Inventory.warehouse_id == wh_id,
                Inventory.product_id == p_id
            ).first()

            avail_qty = inv.available_qty if inv else 0

            # Strict validation check
            if alloc_qty > avail_qty:
                wh_name = wh_map[wh_id].name if wh_id in wh_map else wh_id
                raise ValueError(
                    f"Manual split error for product '{split.get('product_name', p_id)}': "
                    f"Allocated quantity ({alloc_qty}) exceeds available stock ({avail_qty}) at warehouse '{wh_name}'."
                )

            wh_obj = wh_map.get(wh_id)
            weight = float(wh_obj.shipping_cost_weight) if wh_obj else 1.0
            cost = round(alloc_qty * 45.0 * weight, 2)
            total_shipping_cost += cost
            used_warehouse_ids.add(wh_id)

            validated_splits.append({
                "warehouse_id": wh_id,
                "warehouse_name": wh_obj.name if wh_obj else wh_id,
                "product_id": p_id,
                "product_name": split.get("product_name", "Product"),
                "allocated_qty": alloc_qty,
                "quantity_fulfilled": alloc_qty,
                "shipping_cost": cost,
                "status": "Allocated",
                "allocation_strategy": "Manual Override"
            })

        return {
            "quotation_id": quotation_id,
            "fulfillment_splits": validated_splits,
            "total_shipping_cost": round(total_shipping_cost, 2),
            "estimated_shipment_count": len(used_warehouse_ids),
            "is_manual_override": True
        }

    def process_new_inventory(
        self, product_id: str, warehouse_id: str, qty_received: int, db: Session
    ) -> Dict[str, Any]:
        """
        Processes newly arrived inventory and scans for WAITING backorders.
        Returns a trigger payload for the ConsolidateBackorderModal UI prompt.
        """
        try:
            from backend.models import Inventory, Backorder, Product, Warehouse
        except ImportError:
            from models import Inventory, Backorder, Product, Warehouse

        # 1. Update or create Inventory record
        inv = db.query(Inventory).filter(
            Inventory.warehouse_id == warehouse_id,
            Inventory.product_id == product_id
        ).first()

        if inv:
            inv.quantity_on_hand = (inv.quantity_on_hand or 0) + qty_received
        else:
            inv = Inventory(
                id=f"inv-{uuid.uuid4().hex[:6]}",
                warehouse_id=warehouse_id,
                product_id=product_id,
                quantity_on_hand=qty_received,
                quantity_reserved=0
            )
            db.add(inv)

        db.commit()

        product = db.query(Product).filter(Product.id == product_id).first()
        warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()

        # 2. Check for waiting backorders for this product
        waiting_backorders = db.query(Backorder).filter(
            Backorder.product_id == product_id,
            Backorder.status == "WAITING"
        ).all()

        triggered_consolidations = []
        for bo in waiting_backorders:
            can_fulfill = min(qty_received, bo.missing_qty)
            triggered_consolidations.append({
                "trigger_consolidation": True,
                "backorder_id": bo.id,
                "quotation_id": bo.quotation_id,
                "product_id": product_id,
                "product_name": product.name if product else bo.product_name,
                "warehouse_id": warehouse_id,
                "warehouse_name": warehouse.name if warehouse else warehouse_id,
                "qty_received": qty_received,
                "missing_qty": bo.missing_qty,
                "can_fulfill_qty": can_fulfill,
                "message": f"New stock ({qty_received} units) arrived for backordered item '{product.name if product else product_id}'. Consolidate into fulfillment?"
            })

        return {
            "product_id": product_id,
            "warehouse_id": warehouse_id,
            "qty_received": qty_received,
            "new_total_on_hand": inv.quantity_on_hand,
            "triggered_consolidations": triggered_consolidations
        }


# ---------------------------------------------------------------------------
# Backward Compatible Wrapper Function
# ---------------------------------------------------------------------------

def compute_warehouse_split(quote_items: list, warehouses: list, stock_inventory: dict) -> dict:
    engine = OrderFulfillmentEngine()
    
    wh_map = {w.get("id"): w for w in warehouses}
    fulfillment_splits = []
    backorders = []
    total_shipping_cost = 0.0
    used_whs = set()

    for item in quote_items:
        prod_id = item.get("product_id")
        prod_name = item.get("product_name")
        req_qty = item.get("quantity", 1)
        remaining_qty = req_qty

        # Sort warehouses by stock available desc, shipping weight asc
        wh_candidates = []
        for wh in warehouses:
            wh_id = wh.get("id")
            avail = stock_inventory.get((wh_id, prod_id), 0)
            if avail > 0:
                wh_candidates.append({
                    "id": wh_id,
                    "name": wh.get("name"),
                    "available_qty": avail,
                    "weight": float(wh.get("shipping_cost_weight", 1.0))
                })
        wh_candidates.sort(key=lambda x: (-x["available_qty"], x["weight"]))

        for c_wh in wh_candidates:
            if remaining_qty <= 0:
                break
            alloc = min(remaining_qty, c_wh["available_qty"])
            remaining_qty -= alloc
            cost = round(alloc * 45.0 * c_wh["weight"], 2)
            total_shipping_cost += cost
            used_whs.add(c_wh["id"])

            fulfillment_splits.append({
                "warehouse_id": c_wh["id"],
                "warehouse_name": c_wh["name"],
                "product_id": prod_id,
                "product_name": prod_name,
                "quantity_fulfilled": alloc,
                "allocated_qty": alloc,
                "shipment_count": 1,
                "shipping_cost": cost,
                "status": "Allocated"
            })

        if remaining_qty > 0:
            backorders.append({
                "product_id": prod_id,
                "product_name": prod_name,
                "backorder_quantity": remaining_qty,
                "missing_qty": remaining_qty,
                "status": "WAITING"
            })

    return {
        "fulfillment_splits": fulfillment_splits,
        "backorders": backorders,
        "total_shipping_cost": round(total_shipping_cost, 2),
        "total_shipments": len(used_whs)
    }

