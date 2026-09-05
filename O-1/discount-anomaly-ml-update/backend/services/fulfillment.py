"""
DealFlow360 Multi-Warehouse Fulfillment & Auto-Split Engine
Splits orders across warehouses based on stock availability and shipping weight cost optimization.
"""

def compute_warehouse_split(quote_items: list, warehouses: list, stock_inventory: dict) -> dict:
    """
    Computes optimal warehouse fulfillment allocation.
    warehouses: list of dicts [{'id': 'wh-01', 'name': 'Main Warehouse', 'weight': 1.0}]
    stock_inventory: dict {(wh_id, prod_id): available_qty}
    """
    fulfillment_splits = []
    backorders = []
    total_shipping_cost = 0.0
    total_shipments = 0
    
    # Sort warehouses by shipping weight (lowest cost first)
    sorted_warehouses = sorted(warehouses, key=lambda w: w.get("shipping_cost_weight", 1.0))
    
    for item in quote_items:
        prod_id = item.get("product_id")
        prod_name = item.get("product_name")
        req_qty = item.get("quantity", 1)
        remaining_qty = req_qty
        
        # Check warehouse stock in order of lowest shipping cost
        for wh in sorted_warehouses:
            if remaining_qty <= 0:
                break
                
            wh_id = wh.get("id")
            wh_name = wh.get("name")
            avail_stock = stock_inventory.get((wh_id, prod_id), 0)
            
            if avail_stock > 0:
                allocated = min(remaining_qty, avail_stock)
                remaining_qty -= allocated
                
                shipping_cost = round(allocated * 45.0 * float(wh.get("shipping_cost_weight", 1.0)), 2)
                total_shipping_cost += shipping_cost
                total_shipments += 1
                
                fulfillment_splits.append({
                    "warehouse_id": wh_id,
                    "warehouse_name": wh_name,
                    "product_id": prod_id,
                    "product_name": prod_name,
                    "quantity_fulfilled": allocated,
                    "shipment_count": 1,
                    "shipping_cost": shipping_cost,
                    "status": "Allocated"
                })
                
        if remaining_qty > 0:
            backorders.append({
                "product_id": prod_id,
                "product_name": prod_name,
                "backorder_quantity": remaining_qty,
                "status": "Backordered"
            })
            
    return {
        "fulfillment_splits": fulfillment_splits,
        "backorders": backorders,
        "total_shipping_cost": round(total_shipping_cost, 2),
        "total_shipments": total_shipments
    }
