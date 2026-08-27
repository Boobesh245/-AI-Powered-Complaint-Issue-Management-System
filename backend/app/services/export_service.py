import io
import csv
from datetime import datetime
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class ExportService:
    @staticmethod
    def generate_complaints_csv(complaints: list) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        
        headers = [
            "Complaint ID", "Title", "User", "Email", "Category", "Department",
            "Priority", "Status", "Assigned Staff", "SLA Status", "Created At", "Resolved At"
        ]
        writer.writerow(headers)
        
        for c in complaints:
            writer.writerow([
                c.get("complaint_number", ""),
                c.get("title", ""),
                c.get("user_name", ""),
                c.get("user_email", ""),
                c.get("category_name", ""),
                c.get("department_name", ""),
                c.get("priority", "").upper(),
                c.get("status", "").replace("_", " ").title(),
                c.get("assigned_staff_name", "Unassigned"),
                c.get("sla_status", "").replace("_", " ").title(),
                c.get("created_at", ""),
                c.get("resolved_at", "")
            ])
            
        return output.getvalue()

    @staticmethod
    def generate_complaints_pdf(complaints: list, title: str = "Complaints Report") -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter), rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            name='ReportTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor("#1e293b"),
            alignment=1,
            spaceAfter=15
        )
        
        elements = [
            Paragraph(f"<b>{title}</b>", title_style),
            Paragraph(f"<font size='9' color='#64748b'>Generated on {datetime.now().strftime('%B %d, %Y %H:%M:%S')} UTC | Total Records: {len(complaints)}</font>", styles['Normal']),
            Spacer(1, 15)
        ]
        
        # Table data
        table_data = [[
            "ID", "Title", "Category", "Department", "Priority", "Status", "Staff", "Created"
        ]]
        
        for c in complaints[:80]: # Limit for single PDF document
            c_title = c.get("title", "")
            if len(c_title) > 28:
                c_title = c_title[:25] + "..."
            table_data.append([
                c.get("complaint_number", ""),
                c_title,
                c.get("category_name", "") or "-",
                c.get("department_name", "") or "-",
                c.get("priority", "").upper(),
                c.get("status", "").replace("_", " ").title(),
                c.get("assigned_staff_name", "") or "Unassigned",
                str(c.get("created_at", ""))[:10]
            ])
            
        pdf_table = Table(table_data, colWidths=[80, 150, 90, 90, 60, 80, 100, 70])
        pdf_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#ffffff"), colors.HexColor("#f1f5f9")])
        ]))
        
        elements.append(pdf_table)
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

export_service = ExportService()
