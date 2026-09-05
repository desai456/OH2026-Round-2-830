import uuid
import datetime
import hashlib
from sqlalchemy.orm import Session
from fastapi import HTTPException

try:
    from backend.models import PortalToken, Quotation, QuoteItem, LineComment, AuditLog, ApprovalRecord
    from backend.services.governance import DiscountRiskEngine
except ImportError:
    from models import PortalToken, Quotation, QuoteItem, LineComment, AuditLog, ApprovalRecord
    from services.governance import DiscountRiskEngine

class NegotiationEngine:
    def __init__(self, db: Session):
        self.db = db

    def generate_magic_link(self, quotation_id: str, days_valid: int = 7) -> str:
        quote = self.db.query(Quotation).filter(Quotation.id == quotation_id).first()
        if not quote:
            raise HTTPException(status_code=404, detail="Quotation not found")

        raw_str = f"{quotation_id}-{datetime.datetime.utcnow().isoformat()}-{uuid.uuid4().hex}"
        token_hash = hashlib.sha256(raw_str.encode('utf-8')).hexdigest()[:32]
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=days_valid)

        portal_token = PortalToken(
            id=f"ptok-{uuid.uuid4().hex[:6]}",
            quotation_id=quotation_id,
            token=token_hash,
            expires_at=expires_at,
            is_active=True
        )
        self.db.add(portal_token)
        self.db.commit()
        return token_hash

    def validate_token(self, token: str) -> PortalToken:
        p_token = self.db.query(PortalToken).filter(PortalToken.token == token, PortalToken.is_active == True).first()
        if not p_token:
            # Fallback for demo quote IDs used as tokens
            quote_fallback = self.db.query(Quotation).filter(Quotation.id == token).first()
            if quote_fallback:
                p_token = PortalToken(
                    id=f"ptok-{uuid.uuid4().hex[:6]}",
                    quotation_id=quote_fallback.id,
                    token=token,
                    expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=30),
                    is_active=True
                )
            else:
                raise HTTPException(status_code=403, detail="Invalid or expired portal token")

        if p_token.expires_at < datetime.datetime.utcnow():
            p_token.is_active = False
            self.db.commit()
            raise HTTPException(status_code=403, detail="Portal token has expired")

        return p_token

    def get_restricted_quotation(self, token: str) -> dict:
        p_token = self.validate_token(token)
        quote = self.db.query(Quotation).filter(Quotation.id == p_token.quotation_id).first()
        if not quote:
            raise HTTPException(status_code=404, detail="Quotation not found")

        items = self.db.query(QuoteItem).filter(QuoteItem.quotation_id == quote.id).all()
        comments = self.db.query(LineComment).filter(LineComment.quotation_id == quote.id).order_by(LineComment.timestamp.asc()).all()

        # STRICTLY OMIT INTERNAL FIELDS: cost_price, margin_percent, blended_risk_score, internal notes
        return {
            "id": quote.id,
            "quote_number": quote.quote_number,
            "customer_name": quote.customer_name,
            "customer_tier": quote.customer_tier,
            "status": quote.status,
            "subtotal": float(quote.subtotal or 0.0),
            "total_discount": float(quote.total_discount or 0.0),
            "grand_total": float(quote.grand_total or 0.0),
            "items": [
                {
                    "id": i.id,
                    "product_name": i.product_name,
                    "category": i.category,
                    "quantity": i.quantity,
                    "unit_price": float(i.unit_price),
                    "discount_percent": float(i.discount_percent),
                    "line_total": float(i.line_total),
                    "customer_requested_discount_pct": float(getattr(i, 'customer_requested_discount_pct', None) or 0.0) if getattr(i, 'customer_requested_discount_pct', None) is not None else None,
                    "customer_requested_qty": getattr(i, 'customer_requested_qty', None)
                }
                for i in items
            ],
            "comments": [
                {
                    "id": c.id,
                    "quotation_line_id": c.quotation_line_id,
                    "author_type": c.author_type,
                    "author_name": c.author_name,
                    "comment_text": c.comment_text,
                    "timestamp": c.timestamp.isoformat() if c.timestamp else None
                }
                for c in comments
            ]
        }

    def process_counter_offer(self, token: str, payload: dict) -> dict:
        p_token = self.validate_token(token)
        quote = self.db.query(Quotation).filter(Quotation.id == p_token.quotation_id).first()
        if not quote:
            raise HTTPException(status_code=404, detail="Quotation not found")

        author_name = payload.get("author_name", "Customer Representative")
        comment_text = payload.get("comment", "Submitted counter-offer terms.")
        line_updates = payload.get("line_updates", [])

        # Update line item discount & quantity based on customer counter
        for update in line_updates:
            line_id = update.get("line_id")
            req_disc = update.get("requested_discount_pct")
            req_qty = update.get("requested_qty")

            item = self.db.query(QuoteItem).filter(QuoteItem.id == line_id, QuoteItem.quotation_id == quote.id).first()
            if item:
                if req_disc is not None:
                    item.discount_percent = req_disc
                if req_qty is not None and req_qty > 0:
                    item.quantity = req_qty
                
                # Recalculate line total & margin
                l_subtotal = item.quantity * float(item.unit_price)
                l_disc = l_subtotal * (float(item.discount_percent) / 100.0)
                l_total = l_subtotal - l_disc
                l_cost = item.quantity * float(item.cost_price)
                item.line_total = l_total
                item.line_margin = ((l_total - l_cost) / l_total) * 100.0 if l_total > 0 else 0.0

        # Recalculate quotation totals
        items = self.db.query(QuoteItem).filter(QuoteItem.quotation_id == quote.id).all()
        q_subtotal = sum(i.quantity * float(i.unit_price) for i in items)
        q_disc = sum((i.quantity * float(i.unit_price)) * (float(i.discount_percent) / 100.0) for i in items)
        q_total = q_subtotal - q_disc
        q_cost = sum(i.quantity * float(i.cost_price) for i in items)
        q_margin = ((q_total - q_cost) / q_total) * 100.0 if q_total > 0 else 0.0

        quote.subtotal = q_subtotal
        quote.total_discount = q_disc
        quote.grand_total = q_total
        quote.total_cost = q_cost
        quote.margin_percent = q_margin

        # Log line comment
        comment_entry = LineComment(
            id=f"lc-{uuid.uuid4().hex[:6]}",
            quotation_id=quote.id,
            author_type="CUSTOMER",
            author_name=author_name,
            comment_text=comment_text,
            timestamp=datetime.datetime.utcnow()
        )
        self.db.add(comment_entry)

        # Run Blended Risk Engine to evaluate new counter offer terms
        risk_engine = DiscountRiskEngine(self.db)
        risk_res = risk_engine.calculate_blended_risk(quote.id, self.db)
        score = risk_res.get("blended_risk_score", 0)
        routing = risk_res.get("predicted_routing", "FULFILLMENT")

        previous_stage = quote.status or "Draft"

        if routing != "FULFILLMENT" or score > 15:
            # Requires re-approval: Change status to PENDING_MANAGER_APPROVAL and withdraw prior confirmation
            quote.status = "PENDING_MANAGER_APPROVAL"
            quote.blended_risk_score = score
            quote.approval_required = "Sales Manager & Finance" if risk_res.get("require_finance_escalation") else "Sales Manager"

            # Create approval step
            self.db.add(ApprovalRecord(id=f"app-{uuid.uuid4().hex[:6]}", quotation_id=quote.id, step="Sales Manager", status="Pending"))
            new_stage = "PENDING_MANAGER_APPROVAL"
            detail_msg = f"Customer counter-offer increased risk score to {score}%. Re-routed to Manager/Finance approval."
        else:
            quote.status = "UNDER_NEGOTIATION"
            new_stage = "UNDER_NEGOTIATION"
            detail_msg = f"Customer counter-offer accepted for rep review. Risk score is {score}%."

        self.db.add(AuditLog(
            id=f"log-{uuid.uuid4().hex[:6]}",
            quotation_id=quote.id,
            user_id="Customer",
            action="CUSTOMER_COUNTER_OFFER",
            previous_stage=previous_stage,
            new_stage=new_stage,
            rationale_note=comment_text,
            entity_type="Quotation",
            entity_id=quote.id,
            performed_by=author_name,
            details=detail_msg
        ))

        self.db.commit()
        self.db.refresh(quote)

        return {
            "message": "Counter-offer processed successfully",
            "quotation_id": quote.id,
            "new_status": quote.status,
            "grand_total": float(quote.grand_total)
        }

    def accept_quotation(self, token: str) -> dict:
        p_token = self.validate_token(token)
        quote = self.db.query(Quotation).filter(Quotation.id == p_token.quotation_id).first()
        if not quote:
            raise HTTPException(status_code=404, detail="Quotation not found")

        previous_stage = quote.status
        quote.status = "CONFIRMED"

        self.db.add(AuditLog(
            id=f"log-{uuid.uuid4().hex[:6]}",
            quotation_id=quote.id,
            user_id="Customer",
            action="ACCEPT_QUOTATION",
            previous_stage=previous_stage,
            new_stage="CONFIRMED",
            rationale_note="One-click customer acceptance via portal magic link.",
            entity_type="Quotation",
            entity_id=quote.id,
            performed_by=quote.customer_name,
            details=f"Customer accepted quote {quote.quote_number} for total of ${float(quote.grand_total):,.2f}."
        ))

        self.db.commit()
        return {"message": f"Quotation {quote.quote_number} confirmed and accepted!", "status": "CONFIRMED"}
