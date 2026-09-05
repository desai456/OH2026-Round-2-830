from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

try:
    from backend.database import get_db
    from backend.models import User
    from backend.schemas import UserLogin, UserResponse
except ImportError:
    from database import get_db
    from models import User
    from schemas import UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=UserResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Default mock login fallback for smooth demo testing
        return UserResponse(
            id="usr-001",
            email=payload.email,
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

@router.get("/me", response_model=UserResponse)
def get_current_user(email: str = "alex.morgan@dealflow360.com", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
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
