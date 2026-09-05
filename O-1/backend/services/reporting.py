import io
import csv
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

try:
    from backend.models import Quotation, QuoteItem, User, ProductCategory
except ImportError:
    from models import Quotation, QuoteItem, User, ProductCategory

class ReportingEngine:
    def __init__(self, db: Session):
        self.db = db

    def get_filtered_sales_data(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        query = self.db.query(Quotation)

        date_from = filters.get("date_from") or filters.get("start_date")
        date_to = filters.get("date_to") or filters.get("end_date")
        sales_rep = filters.get("sales_rep_id") or filters.get("rep_name") or filters.get("sales_rep")
        approval_status = filters.get("approval_status") or filters.get("status")
        category = filters.get("category_id") or filters.get("category")

        # Dynamic Incremental Filtering
        if date_from:
            try:
                dt_from = datetime.datetime.fromisoformat(str(date_from))
                query = query.filter(Quotation.created_at >= dt_from)
            except ValueError:
                pass

        if date_to:
            try:
                dt_to = datetime.datetime.fromisoformat(str(date_to))
                query = query.filter(Quotation.created_at <= dt_to)
            except ValueError:
                pass

        if sales_rep and sales_rep != "All":
            query = query.filter(Quotation.rep_name == sales_rep)

        if approval_status and approval_status != "All":
            query = query.filter(Quotation.status == approval_status)

        if category and category != "All":
            query = query.join(QuoteItem, Quotation.id == QuoteItem.quotation_id).filter(QuoteItem.category == category)

        quotes = query.order_by(Quotation.created_at.desc()).all()

        results = []
        for q in quotes:
            items = self.db.query(QuoteItem).filter(QuoteItem.quotation_id == q.id).all()
            results.append({
                "id": q.id,
                "quote_number": q.quote_number,
                "created_at": q.created_at.strftime("%Y-%m-%d") if q.created_at else "",
                "rep_name": q.rep_name,
                "customer_name": q.customer_name,
                "customer_tier": q.customer_tier,
                "subtotal": float(q.subtotal or 0.0),
                "total_discount": float(q.total_discount or 0.0),
                "grand_total": float(q.grand_total or 0.0),
                "margin_percent": float(q.margin_percent or 0.0),
                "blended_risk_score": float(q.blended_risk_score or 0.0),
                "status": q.status,
                "item_count": len(items)
            })

        return results

    def generate_csv_export(self, data: List[Dict[str, Any]]) -> bytes:
        output = io.StringIO()
        writer = csv.writer(output)

        # Header Row
        writer.writerow([
            "Quote ID", "Quote Number", "Created Date", "Sales Rep",
            "Customer Name", "Customer Tier", "Grand Total ($)",
            "Blended Margin (%)", "Risk Score", "Status"
        ])

        # Data Rows
        for row in data:
            writer.writerow([
                row.get("id"),
                row.get("quote_number"),
                row.get("created_at"),
                row.get("rep_name"),
                row.get("customer_name"),
                row.get("customer_tier"),
                f"{row.get('grand_total', 0.0):.2f}",
                f"{row.get('margin_percent', 0.0):.2f}",
                row.get("blended_risk_score"),
                row.get("status")
            ])

        return output.getvalue().encode('utf-8')

    def generate_quotation_pdf(self, quotation_id: str) -> bytes:
        quote = self.db.query(Quotation).filter(Quotation.id == quotation_id).first()
        if not quote:
            raise HTTPException(status_code=404, detail="Quotation not found")

        items = self.db.query(QuoteItem).filter(QuoteItem.quotation_id == quotation_id).all()

        # Generate PDF using ReportLab or fallback clean PDF generator
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors

            pdf_buffer = io.BytesIO()
            doc = SimpleDocTemplate(pdf_buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
            styles = getSampleStyleSheet()

            story = []
            # Title
            title_style = ParagraphStyle(
                'DocTitle',
                parent=styles['Heading1'],
                fontSize=20,
                textColor=colors.HexColor("#FF4A1C"),
                spaceAfter=12
            )
            story.append(Paragraph(f"DealFlow360 Official Quotation — {quote.quote_number}", title_style))
            story.append(Spacer(1, 10))

            # Metadata Table
            meta_data = [
                ["Customer:", quote.customer_name, "Date:", quote.created_at.strftime("%Y-%m-%d") if quote.created_at else ""],
                ["Customer Tier:", quote.customer_tier, "Sales Representative:", quote.rep_name],
                ["Quotation Status:", quote.status, "Blended Margin:", f"{float(quote.margin_percent or 0.0):.1f}%"]
            ]
            meta_table = Table(meta_data, colWidths=[100, 180, 120, 140])
            meta_table.setStyle(TableStyle([
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#333333")),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(meta_table)
            story.append(Spacer(1, 15))

            # Items Table Header
            items_data = [["Product Description", "Category", "Qty", "Unit Price", "Discount", "Total Amount"]]
            for item in items:
                items_data.append([
                    item.product_name,
                    item.category,
                    str(item.quantity),
                    f"${float(item.unit_price):,.2f}",
                    f"{float(item.discount_percent):.1f}%",
                    f"${float(item.line_total):,.2f}"
                ])

            # Totals summary row
            items_data.append(["", "", "", "", "Grand Total:", f"${float(quote.grand_total or 0.0):,.2f}"])

            items_table = Table(items_data, colWidths=[200, 80, 40, 75, 65, 80])
            items_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#151517")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -2), 0.5, colors.HexColor("#DDDDDD")),
                ('LINEABOVE', (4, -1), (5, -1), 1, colors.HexColor("#FF4A1C")),
                ('FONTNAME', (4, -1), (5, -1), 'Helvetica-Bold'),
            ]))
            story.append(items_table)

            doc.build(story)
            pdf_bytes = pdf_buffer.getvalue()
            pdf_buffer.close()
            return pdf_bytes

        except ImportError:
            # Fallback text/binary PDF stream generator if ReportLab is missing
            pdf_content = (
                f"%PDF-1.4\n"
                f"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
                f"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
                f"3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n"
                f"4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
                f"5 0 obj << /Length 200 >> stream\n"
                f"BT /F1 16 Tf 50 750 TD (DEALFLOW360 QUOTATION - {quote.quote_number}) Tj ET\n"
                f"BT /F1 12 Tf 50 720 TD (Customer: {quote.customer_name} | Total: ${float(quote.grand_total or 0.0):,.2f}) Tj ET\n"
                f"endstream endobj\n"
                f"xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000212 00000 n \n0000000287 00000 n \n"
                f"trailer << /Size 6 /Root 1 0 R >>\nstartxref\n530\n%%EOF"
            )
            return pdf_content.encode('utf-8')
