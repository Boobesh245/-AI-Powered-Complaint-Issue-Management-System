from pydantic import BaseModel
from typing import Optional, List

class SystemSettingsSchema(BaseModel):
    app_name: str = "AI-Powered Complaint & Issue Management System"
    default_priority: str = "medium"
    default_status: str = "submitted"
    max_file_size_mb: int = 10
    allowed_file_types: List[str] = ["jpg", "jpeg", "png", "pdf", "doc", "docx"]
    enable_ai_classification: bool = True
    ai_duplicate_threshold: float = 0.75
    email_notifications_enabled: bool = False
    maintenance_mode: bool = False
    sla_critical_hours: int = 24
    sla_high_hours: int = 48
    sla_medium_hours: int = 72
    sla_low_hours: int = 120
