from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class OverviewResponse(BaseModel):
    total_complaints: int
    pending: int
    in_progress: int
    resolved: int
    closed: int
    critical: int
    total_users: int
    active_staff: int
    resolution_rate: float
    average_resolution_hours: float
    sla_compliance_rate: float
    average_satisfaction: float

class TrendResponse(BaseModel):
    labels: List[str]
    submitted: List[int]
    resolved: List[int]
    closed: List[int]
    reopened: List[int]

class DistributionResponse(BaseModel):
    labels: List[str]
    data: List[int]
    percentages: Optional[List[float]] = []

class DepartmentPerformanceItem(BaseModel):
    department: str
    total: int
    resolved: int
    pending: int
    resolution_rate: float
    avg_resolution_hours: float

class StaffPerformanceItem(BaseModel):
    staff_name: str
    department: str
    assigned: int
    resolved: int
    pending: int
    avg_resolution_hours: float
    rating: float
    sla_compliance: float

class ResolutionTimeMetrics(BaseModel):
    avg_hours: float
    median_hours: float
    fastest_hours: float
    longest_hours: float
    distribution: Dict[str, int]

class SLAMetrics(BaseModel):
    within_sla: int
    at_risk: int
    breached: int
    compliance_rate: float

class SatisfactionMetrics(BaseModel):
    average_rating: float
    total_reviews: int
    ratings_breakdown: Dict[str, int]
    trend: Dict[str, Any]

class AIInsightsResponse(BaseModel):
    insights: List[str]
    high_risk_complaints: List[Dict[str, Any]]
    potential_duplicates: List[Dict[str, Any]]
    emerging_categories: List[Dict[str, Any]]
