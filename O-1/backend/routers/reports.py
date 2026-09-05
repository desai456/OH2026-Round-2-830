import io
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional

try:
    from backend.database import get_db
    from backend.services.reporting import ReportingEngine
except ImportError:
    from database import get_db
    from services.reporting import ReportingEngine

router = APIRouter(prefix="/reports", tags=["Reporting & Export Engine"])

@router.get("/sales")
def get_filtered_sales_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    rep_id: Optional[str] = None,
    sales_rep: Optional[str] = None,
    status: Optional[str] = None,
    approval_status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    GET /api/reports/sales
    Executes dynamic SQLAlchemy query based on optional filter parameters.
    """
    engine = ReportingEngine(db)
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "sales_rep": rep_id or sales_rep,
        "status": status or approval_status,
        "category": category
    }
    return engine.get_filtered_sales_data(filters)

@router.get("/sales/export")
def export_sales_report_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    rep_id: Optional[str] = None,
    sales_rep: Optional[str] = None,
    status: Optional[str] = None,
    approval_status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    GET /api/reports/sales/export
    Returns StreamingResponse with text/csv media type forcing browser CSV file download.
    """
    engine = ReportingEngine(db)
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "sales_rep": rep_id or sales_rep,
        "status": status or approval_status,
        "category": category
    }
    data = engine.get_filtered_sales_data(filters)
    csv_bytes = engine.generate_csv_export(data)

    return StreamingResponse(
        io.BytesIO(csv_bytes),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sales_report.csv"}
    )
