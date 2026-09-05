from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

try:
    from backend.database import get_db
    from backend.models import Warehouse, Inventory, Quotation, QuoteItem, FulfillmentSplit, Product
    from backend.services.fulfillment import compute_warehouse_split
except ImportError:
    from database import get_db
    from models import Warehouse, Inventory, Quotation, QuoteItem, FulfillmentSplit, Product
    from services.fulfillment import compute_warehouse_split

router = APIRouter(prefix="/warehouses", tags=["Fulfillment & Warehouses"])

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
def get_fulfillment_split_recommendation(quote_id: str, db: Session = Depends(get_db)):
    quote = db.query(Quotation).filter(Quotation.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")
        
    items = db.query(QuoteItem).filter(QuoteItem.quotation_id == quote_id).all()
    warehouses = db.query(Warehouse).all()
    inventories = db.query(Inventory).all()
    
    wh_list = [{"id": w.id, "name": w.name, "shipping_cost_weight": float(w.shipping_cost_weight)} for w in warehouses]
    inv_dict = {(i.warehouse_id, i.product_id): i.quantity_on_hand for i in inventories}
    
    quote_item_list = [
        {
            "product_id": item.product_id,
            "product_name": item.product_name,
            "quantity": item.quantity
        }
        for item in items
    ]
    
    split_result = compute_warehouse_split(quote_item_list, wh_list, inv_dict)
    return {
        "quotation_id": quote_id,
        "recommendation": split_result
    }
