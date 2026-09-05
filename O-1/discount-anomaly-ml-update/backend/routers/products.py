from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

try:
    from backend.database import get_db
    from backend.models import Product, DiscountTier
    from backend.schemas import ProductResponse, ProductCreate
except ImportError:
    from database import get_db
    from models import Product, DiscountTier
    from schemas import ProductResponse, ProductCreate

router = APIRouter(prefix="/products", tags=["Products & Pricing"])

@router.get("/", response_model=List[ProductResponse])
def list_products(category: str = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    products = query.all()
    return [
        ProductResponse(
            id=p.id,
            sku=p.sku,
            name=p.name,
            category=p.category,
            unit_price=float(p.unit_price),
            cost_price=float(p.cost_price),
            unit=p.unit,
            tax_rate=float(p.tax_rate),
            description=p.description,
            promoted=p.promoted,
            image_url=p.image_url
        )
        for p in products
    ]

@router.post("/", response_model=ProductResponse)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    prod_id = f"prod-{uuid.uuid4().hex[:6]}"
    product = Product(
        id=prod_id,
        sku=payload.sku,
        name=payload.name,
        category=payload.category,
        unit_price=payload.unit_price,
        cost_price=payload.cost_price,
        unit=payload.unit,
        tax_rate=payload.tax_rate,
        description=payload.description,
        promoted=payload.promoted
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return ProductResponse(
        id=product.id,
        sku=product.sku,
        name=product.name,
        category=product.category,
        unit_price=float(product.unit_price),
        cost_price=float(product.cost_price),
        unit=product.unit,
        tax_rate=float(product.tax_rate),
        description=product.description,
        promoted=product.promoted
    )

@router.get("/discount-tiers")
def list_discount_tiers(db: Session = Depends(get_db)):
    tiers = db.query(DiscountTier).all()
    return [
        {
            "id": t.id,
            "customer_tier": t.customer_tier,
            "category": t.category,
            "max_discount_percent": float(t.max_discount_percent)
        }
        for t in tiers
    ]
