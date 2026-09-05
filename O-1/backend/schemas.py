from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date

class UserLogin(BaseModel):
    email: str
    password: str

class UserSignup(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "Sales Rep"
    customer_tier: Optional[str] = "Gold"
    company_name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    customer_tier: Optional[str] = "Gold"
    company_name: Optional[str] = None


class ProductCreate(BaseModel):
    sku: str
    name: str
    category: str
    unit_price: float
    cost_price: float
    unit: Optional[str] = "unit"
    tax_rate: Optional[float] = 18.00
    description: Optional[str] = None
    promoted: Optional[bool] = False

class ProductResponse(ProductCreate):
    id: str
    image_url: Optional[str] = None

class QuoteItemInput(BaseModel):
    product_id: str
    product_name: str
    category: str
    quantity: int = Field(gt=0)
    unit_price: float
    cost_price: float
    discount_percent: float = 0.0
    is_recurring: bool = False
    billing_cycle: Optional[str] = None

class QuoteCreateInput(BaseModel):
    customer_name: str
    customer_tier: str = "Gold"
    rep_name: str
    notes: Optional[str] = None
    items: List[QuoteItemInput]

class QuoteResponse(BaseModel):
    id: str
    quote_number: str
    customer_name: str
    customer_tier: str
    rep_name: str
    status: str
    blended_risk_score: int
    approval_required: str
    subtotal: float
    total_discount: float
    grand_total: float
    margin_percent: float
    notes: Optional[str] = None
    items: List[QuoteItemInput]

class ApprovalActionInput(BaseModel):
    quotation_id: str
    step: str # 'Sales Manager' or 'Finance'
    status: str # 'Approved' or 'Rejected'
    approver_name: str
    comments: Optional[str] = None

class NegotiationInput(BaseModel):
    quotation_id: str
    author_name: str
    author_role: str
    comment: str
    proposed_discount: Optional[float] = None

# Customer Portal Restricted Schema (Physical Data Leakage Prevention)
class CustomerQuoteItemResponse(BaseModel):
    id: str
    product_name: str
    category: str
    quantity: int
    unit_price: float
    discount_percent: float
    line_total: float
    customer_requested_discount_pct: Optional[float] = None
    customer_requested_qty: Optional[int] = None

class CustomerLineCommentResponse(BaseModel):
    id: str
    quotation_line_id: Optional[str] = None
    author_type: str
    author_name: str
    comment_text: str
    timestamp: Optional[str] = None

class CustomerQuotationResponse(BaseModel):
    quote_number: str
    customer_name: str
    customer_tier: str
    status: str
    subtotal: float
    total_discount: float
    grand_total: float
    items: List[CustomerQuoteItemResponse] = []
    comments: List[CustomerLineCommentResponse] = []

class LineUpdatePayloadItem(BaseModel):
    line_id: str
    requested_discount_pct: Optional[float] = None
    requested_qty: Optional[int] = None

class CounterOfferPayload(BaseModel):
    author_name: str = "Customer Representative"
    comment: Optional[str] = "Submitted counter offer terms"
    line_updates: List[LineUpdatePayloadItem] = []

class CartItemInput(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)
    discount_pct: float = 0.0

class CartPreviewInput(BaseModel):
    items: List[CartItemInput]

class CartLineOutput(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    list_price: float
    cost_price: float
    discount_pct: float
    selling_price: float
    line_total: float
    line_cost: float
    line_margin_pct: float

class CartPreviewResponse(BaseModel):
    lines: List[CartLineOutput]
    subtotal: float
    total_discount: float
    total_selling_price: float
    total_cost: float
    blended_margin_pct: float

class PipelineStageUpdateInput(BaseModel):
    new_stage: str

class NudgeInput(BaseModel):
    action_type: str = "CUSTOMER_REMINDER" # 'CUSTOMER_REMINDER' or 'MANAGER_ESCALATION'

