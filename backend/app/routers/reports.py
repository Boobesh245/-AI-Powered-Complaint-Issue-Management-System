from fastapi import APIRouter, Depends, Query, Response
from typing import Optional
from app.database import get_database
from app.services.export_service import export_service
from app.services.analytics_service import analytics_service
from app.utils.helpers import serialize_mongo
from app.middleware.auth import require_admin

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/complaints/csv")
def export_complaints_csv(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    department_id: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    query = {}
    if status and status != "all":
        query["status"] = status
    if priority and priority != "all":
        query["priority"] = priority
    if department_id and department_id != "all":
        query["department_id"] = department_id

    complaints = list(db.complaints.find(query).sort("created_at", -1))
    csv_content = export_service.generate_complaints_csv(complaints)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=complaints_report.csv"}
    )

@router.get("/complaints/pdf")
def export_complaints_pdf(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    department_id: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    query = {}
    if status and status != "all":
        query["status"] = status
    if priority and priority != "all":
        query["priority"] = priority
    if department_id and department_id != "all":
        query["department_id"] = department_id

    complaints = list(db.complaints.find(query).sort("created_at", -1))
    pdf_bytes = export_service.generate_complaints_pdf(complaints, "Complaints Summary Report")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=complaints_report.pdf"}
    )

@router.get("/summary")
def get_reports_summary(current_user: dict = Depends(require_admin)):
    db = get_database()
    overview = analytics_service.get_dashboard_overview()
    dept_perf = analytics_service.get_department_performance()
    staff_perf = analytics_service.get_staff_performance()
    sla = analytics_service.get_sla_metrics()
    
    return {
        "success": True,
        "data": {
            "overview": overview,
            "department_reports": dept_perf,
            "staff_reports": staff_perf,
            "sla_reports": sla
        }
    }
