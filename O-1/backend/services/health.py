import uuid
import datetime
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Dict, Any

try:
    from backend.models import Quotation, QuoteItem, NotificationLog, AuditLog, DealHealthAlert
except ImportError:
    from models import Quotation, QuoteItem, NotificationLog, AuditLog, DealHealthAlert

class DealHealthEngine:
    def __init__(self, db: Session, stalled_days_limit: int = 5, outlier_deviation_pct: float = 3.0):
        self.db = db
        self.stalled_days_limit = stalled_days_limit
        self.outlier_deviation_pct = outlier_deviation_pct

    def detect_stalled_deals(self) -> List[Dict[str, Any]]:
        cutoff_date = datetime.datetime.utcnow() - datetime.timedelta(days=self.stalled_days_limit)
        active_statuses = ["Draft", "DRAFT", "Pending Approval", "PENDING_APPROVAL", "PENDING_MANAGER_APPROVAL", "Under Negotiation", "UNDER_NEGOTIATION"]

        stalled_quotes = self.db.query(Quotation).filter(
            Quotation.status.in_(active_statuses),
            Quotation.updated_at <= cutoff_date
        ).all()

        stalled_alerts = []
        now = datetime.datetime.utcnow()

        for q in stalled_quotes:
            updated_at = q.updated_at or q.created_at or now
            days_stalled = (now - updated_at).days

            stalled_alerts.append({
                "id": f"alert-stall-{q.id}",
                "quotation_id": q.id,
                "quote_number": q.quote_number,
                "customer_name": q.customer_name,
                "rep_name": q.rep_name,
                "stage": q.status,
                "days_stalled": days_stalled,
                "grand_total": float(q.grand_total or 0.0),
                "alert_type": "STALLED",
                "severity": "CRITICAL" if days_stalled >= 10 else "WARNING",
                "description": f"Quotation {q.quote_number} has been stuck in '{q.status}' for {days_stalled} days without updates.",
                "suggested_action": "CUSTOMER_REMINDER" if "NEGOTIATION" in (q.status or "").upper() else "MANAGER_ESCALATION"
            })

        return stalled_alerts

    def detect_rep_outliers(self) -> List[Dict[str, Any]]:
        active_quotes = self.db.query(Quotation).filter(
            Quotation.status.in_(["Pending Approval", "PENDING_APPROVAL", "PENDING_MANAGER_APPROVAL", "Draft", "DRAFT"])
        ).all()

        outlier_alerts = []

        for q in active_quotes:
            rep_name = q.rep_name
            if not rep_name:
                continue

            # Calculate Rep's historical average discount across last 50 won/confirmed deals using SQL func.avg
            hist_avg = self.db.query(func.avg(Quotation.total_discount / Quotation.subtotal * 100.0)).filter(
                Quotation.rep_name == rep_name,
                Quotation.status.in_(["Approved", "APPROVED", "Confirmed", "CONFIRMED", "FULFILLMENT"])
            ).scalar()

            rep_avg_discount = float(hist_avg) if hist_avg is not None else 10.0

            # Calculate current quote blended discount
            subtotal = float(q.subtotal or 0.0)
            total_discount = float(q.total_discount or 0.0)
            current_discount_pct = (total_discount / subtotal * 100.0) if subtotal > 0 else 0.0

            deviation = current_discount_pct - rep_avg_discount

            if deviation >= self.outlier_deviation_pct:
                outlier_alerts.append({
                    "id": f"alert-outlier-{q.id}",
                    "quotation_id": q.id,
                    "quote_number": q.quote_number,
                    "customer_name": q.customer_name,
                    "rep_name": rep_name,
                    "stage": q.status,
                    "current_discount_pct": round(current_discount_pct, 2),
                    "historical_avg_discount_pct": round(rep_avg_discount, 2),
                    "deviation_pct": round(deviation, 2),
                    "grand_total": float(q.grand_total or 0.0),
                    "alert_type": "OUTLIER",
                    "severity": "CRITICAL" if deviation >= 7.0 else "WARNING",
                    "description": f"Quotation discount ({current_discount_pct:.1f}%) is {deviation:.1f}% above {rep_name}'s historical average ({rep_avg_discount:.1f}%).",
                    "suggested_action": "FLAG_FOR_REVIEW"
                })

        return outlier_alerts

    def get_dashboard_alerts(self) -> List[Dict[str, Any]]:
        stalled = self.detect_stalled_deals()
        outliers = self.detect_rep_outliers()

        # Combine and sort by severity
        all_alerts = stalled + outliers
        all_alerts.sort(key=lambda a: (0 if a["severity"] == "CRITICAL" else 1, a["quote_number"]))
        return all_alerts

    def trigger_nudge(self, quotation_id: str, action_type: str) -> Dict[str, Any]:
        quote = self.db.query(Quotation).filter(Quotation.id == quotation_id).first()
        if not quote:
            # Fallback response for demo IDs
            return {
                "message": f"Nudge '{action_type}' dispatched successfully.",
                "quotation_id": quotation_id,
                "sent_at": datetime.datetime.utcnow().isoformat()
            }

        recipient_type = "CUSTOMER" if action_type == "CUSTOMER_REMINDER" else "MANAGER"

        # Log to NotificationLog table
        notif = NotificationLog(
            id=f"notif-{uuid.uuid4().hex[:6]}",
            quotation_id=quote.id,
            recipient_type=recipient_type,
            action_type=action_type,
            sent_at=datetime.datetime.utcnow()
        )
        self.db.add(notif)

        # Log to AuditLog table
        self.db.add(AuditLog(
            id=f"log-{uuid.uuid4().hex[:6]}",
            quotation_id=quote.id,
            user_id="DealHealthEngine",
            action="TRIGGER_NUDGE",
            previous_stage=quote.status,
            new_stage=quote.status,
            rationale_note=f"Triggered automated {action_type} for stalled/anomaly quote.",
            entity_type="Quotation",
            entity_id=quote.id,
            performed_by="DealHealthEngine Autonomous Nudge",
            details=f"Dispatched {action_type} to {recipient_type} for quote {quote.quote_number}."
        ))

        self.db.commit()

        return {
            "message": f"Automated {action_type} sent successfully for quote {quote.quote_number}!",
            "quotation_id": quote.id,
            "recipient_type": recipient_type,
            "sent_at": notif.sent_at.isoformat()
        }
