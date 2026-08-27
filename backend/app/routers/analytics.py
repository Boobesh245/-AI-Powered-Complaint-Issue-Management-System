from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.services.analytics_service import analytics_service
from app.middleware.auth import require_admin, get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def get_analytics_filter(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    department_id: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    staff_id: Optional[str] = Query(None)
):
    return analytics_service._build_match_filter(
        start_date=start_date,
        end_date=end_date,
        department_id=department_id,
        category_id=category_id,
        priority=priority,
        status=status,
        staff_id=staff_id
    )

@router.get("/overview")
def overview(filters: dict = Depends(get_analytics_filter), current_user: dict = Depends(require_admin)):
    data = analytics_service.get_dashboard_overview(filters)
    return {"success": True, "data": data}

@router.get("/complaint-trends")
def complaint_trends(days: int = Query(14), filters: dict = Depends(get_analytics_filter), current_user: dict = Depends(require_admin)):
    data = analytics_service.get_complaint_trends(filters, days=days)
    return {"success": True, "data": data}

@router.get("/status-distribution")
def status_distribution(filters: dict = Depends(get_analytics_filter), current_user: dict = Depends(require_admin)):
    data = analytics_service.get_status_distribution(filters)
    return {"success": True, "data": data}

@router.get("/priority-distribution")
def priority_distribution(filters: dict = Depends(get_analytics_filter), current_user: dict = Depends(require_admin)):
    data = analytics_service.get_priority_distribution(filters)
    return {"success": True, "data": data}

@router.get("/category-distribution")
def category_distribution(filters: dict = Depends(get_analytics_filter), current_user: dict = Depends(require_admin)):
    data = analytics_service.get_category_distribution(filters)
    return {"success": True, "data": data}

@router.get("/department-performance")
def department_performance(filters: dict = Depends(get_analytics_filter), current_user: dict = Depends(require_admin)):
    data = analytics_service.get_department_performance(filters)
    return {"success": True, "data": data}

@router.get("/resolution-time")
def resolution_time(filters: dict = Depends(get_analytics_filter), current_user: dict = Depends(require_admin)):
    data = analytics_service.get_resolution_metrics(filters)
    return {"success": True, "data": data}

@router.get("/sla")
def sla_metrics(filters: dict = Depends(get_analytics_filter), current_user: dict = Depends(require_admin)):
    data = analytics_service.get_sla_metrics(filters)
    return {"success": True, "data": data}

@router.get("/staff-performance")
def staff_performance(filters: dict = Depends(get_analytics_filter), current_user: dict = Depends(require_admin)):
    data = analytics_service.get_staff_performance(filters)
    return {"success": True, "data": data}

@router.get("/users")
def user_analytics(filters: dict = Depends(get_analytics_filter), current_user: dict = Depends(require_admin)):
    data = analytics_service.get_user_metrics(filters)
    return {"success": True, "data": data}

@router.get("/satisfaction")
def satisfaction(filters: dict = Depends(get_analytics_filter), current_user: dict = Depends(require_admin)):
    data = analytics_service.get_satisfaction_metrics(filters)
    return {"success": True, "data": data}

@router.get("/ai-insights")
def ai_insights(current_user: dict = Depends(require_admin)):
    data = analytics_service.get_ai_insights()
    return {"success": True, "data": data}
