from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

try:
    from backend.database import get_db
    from backend.models import Quotation, Invoice, AuditLog
except ImportError:
    from database import get_db
    from models import Quotation, Invoice, AuditLog

router = APIRouter(prefix="/reports", tags=["Reporting & Dashboards"])

@router.get("/summary")
def get_reporting_summary(period: str = "All", sales_rep: str = "All", approval_status: str = "All", db: Session = Depends(get_db)):
    quotes_query = db.query(Quotation)
    if sales_rep != "All":
        quotes_query = quotes_query.filter(Quotation.rep_name == sales_rep)
    if approval_status != "All":
        quotes_query = quotes_query.filter(Quotation.status == approval_status)
        
    quotes = quotes_query.all()
    
    total_pipeline = sum(float(q.grand_total or 0.0) for q in quotes)
    avg_margin = sum(float(q.margin_percent or 0.0) for q in quotes) / len(quotes) if quotes else 0.0
    pending_count = sum(1 for q in quotes if q.status == "Pending Approval")
    approved_count = sum(1 for q in quotes if q.status == "Approved")
    
    return {
        "period": period,
        "sales_rep_filter": sales_rep,
        "approval_status_filter": approval_status,
        "total_pipeline_value": round(total_pipeline, 2),
        "average_margin_percent": round(avg_margin, 2),
        "total_quotations": len(quotes),
        "pending_approvals": pending_count,
        "approved_quotations": approved_count
    }

@router.get("/export/{export_type}")
def export_report(export_type: str):
    if export_type not in ["pdf", "xls", "csv"]:
        raise HTTPException(status_code=400, detail="Invalid export type. Supported: pdf, xls, csv")
        
    return {
        "export_type": export_type.upper(),
        "download_url": f"/static/exports/sales_report_2026.{export_type}",
        "status": "Ready for download"
    }
