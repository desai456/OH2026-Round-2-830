from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

try:
    from backend.database import get_db
    from backend.models import User
    from backend.schemas import UserLogin, UserSignup, UserResponse
except ImportError:
    from database import get_db
    from models import User
    from schemas import UserLogin, UserSignup, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    clean_email = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        # Return existing user if already present
        return UserResponse(
            id=existing.id,
            email=existing.email,
            full_name=existing.full_name,
            role=existing.role,
            customer_tier=existing.customer_tier or "Gold",
            company_name=existing.company_name or "DealFlow360 Internal"
        )
    
    user_id = f"usr-{uuid.uuid4().hex[:6]}"
    new_user = User(
        id=user_id,
        email=clean_email,
        password_hash=f"$2b$12$hash_{payload.password}",
        full_name=payload.full_name,
        role=payload.role,
        customer_tier=payload.customer_tier or "Gold",
        company_name=payload.company_name or ("DealFlow360 Internal" if payload.role != "Customer" else "Customer Org")
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        customer_tier=new_user.customer_tier,
        company_name=new_user.company_name
    )

@router.post("/login", response_model=UserResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    clean_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        # Fallback to create account if not exists
        user_id = f"usr-{uuid.uuid4().hex[:6]}"
        user = User(
            id=user_id,
            email=clean_email,
            password_hash=f"$2b$12$hash_{payload.password}",
            full_name=clean_email.split('@')[0].replace('.', ' ').title(),
            role="Sales Rep",
            customer_tier="Gold",
            company_name="DealFlow360 Internal"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        customer_tier=user.customer_tier,
        company_name=user.company_name
    )

@router.get("/me", response_model=UserResponse)
def get_current_user(email: str = "alex.morgan@dealflow360.com", db: Session = Depends(get_db)):
    clean_email = email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        return UserResponse(
            id="usr-001",
            email="alex.morgan@dealflow360.com",
            full_name="Alex Morgan",
            role="Sales Rep",
            customer_tier="Gold",
            company_name="DealFlow360 Internal"
        )
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        customer_tier=user.customer_tier,
        company_name=user.company_name
    )

