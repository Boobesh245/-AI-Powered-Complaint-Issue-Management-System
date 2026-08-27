# AI-Powered Complaint & Issue Management System

## 1. Project Overview

Build a production-style full-stack web application called:

**AI-Powered Complaint & Issue Management System**

The system allows users to submit complaints/issues, track their status, communicate with administrators, and receive notifications.

Administrators can manage users, complaints, categories, departments, staff, priorities, assignments, notifications, reports, analytics, and system configuration.

The application must include an advanced Admin Dashboard with analytics, charts, filters, tables, search, pagination, exports, and role-based access control.

The project is intended as a final-year college project but should be implemented with professional software engineering practices.

---

# 2. Technology Stack

## Frontend

- React.js
- JavaScript
- Bootstrap 5
- React Router
- Axios
- Bootstrap Icons
- Chart.js
- react-chartjs-2
- React Hook Form
- Context API
- CSS
- Responsive design

## Backend

- Python 3.11+
- FastAPI
- Pydantic
- Uvicorn
- PyMongo
- Python-Jose
- Passlib
- Bcrypt
- Python Multipart

## Database

- MongoDB
- MongoDB Atlas for cloud deployment
- PyMongo for database communication

## Analytics

- Chart.js
- react-chartjs-2
- MongoDB aggregation pipelines
- Python analytics processing
- FastAPI analytics APIs

## Development Tools

- Git
- GitHub
- VS Code
- Postman
- MongoDB Compass
- npm
- pip

## Optional Tools

- Docker
- Docker Compose
- Redis
- Celery
- Cloudinary
- Email service
- OpenAI-compatible LLM API

---

# 3. Main Objectives

The system should solve the following problems:

1. Manual complaint management.
2. Lack of complaint tracking.
3. Poor complaint categorization.
4. Delayed complaint resolution.
5. Lack of administrator analytics.
6. No centralized complaint history.
7. Difficulty identifying high-priority complaints.
8. Difficulty assigning complaints to staff.
9. Lack of department-wise performance tracking.
10. Lack of user feedback mechanisms.
11. Lack of reporting.
12. Lack of real-time status visibility.

---

# 4. User Roles

## 4.1 Super Admin

Permissions:

- Full system access.
- Manage administrators.
- Manage staff.
- Manage users.
- Manage departments.
- Manage categories.
- Manage system settings.
- View all complaints.
- View all analytics.
- Export reports.
- View audit logs.

## 4.2 Admin

Permissions:

- Manage complaints.
- Assign complaints.
- Manage users.
- Manage staff.
- View analytics.
- Manage categories.
- Manage departments.
- Generate reports.

## 4.3 Staff

Permissions:

- View assigned complaints.
- Update complaint status.
- Add comments.
- Upload evidence.
- Mark complaints as resolved.
- View assigned analytics.

## 4.4 User

Permissions:

- Register.
- Login.
- Submit complaint.
- Upload attachments.
- View complaint status.
- Add comments.
- Respond to admin.
- Reopen complaint.
- Rate resolution.
- View complaint history.

---

# 5. Authentication

Implement secure authentication.

## Features

- User registration.
- User login.
- JWT authentication.
- Access token.
- Password hashing.
- Role-based authorization.
- Protected routes.
- Logout.
- Password reset.
- Account activation.
- Account deactivation.
- Session expiration.

## Login Flow

```text
React Login Page
        |
        v
FastAPI /auth/login
        |
        v
Validate Credentials
        |
        v
Generate JWT
        |
        v
Return Token
        |
        v
React Stores Token
        |
        v
Protected Dashboard
```

---

# 6. Frontend Architecture

Use a modular React architecture.

```text
frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── admin/
│   ├── user/
│   ├── staff/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   ├── charts/
│   ├── routes/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── README.md
```

---

# 7. Backend Architecture

```text
backend/
│
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── complaint.py
│   │   ├── category.py
│   │   ├── department.py
│   │   ├── staff.py
│   │   ├── notification.py
│   │   └── audit.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── complaint.py
│   │   ├── category.py
│   │   ├── department.py
│   │   └── analytics.py
│   │
│   ├── routers/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── complaints.py
│   │   ├── categories.py
│   │   ├── departments.py
│   │   ├── staff.py
│   │   ├── notifications.py
│   │   ├── analytics.py
│   │   ├── reports.py
│   │   └── settings.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── complaint_service.py
│   │   ├── analytics_service.py
│   │   ├── notification_service.py
│   │   └── ai_service.py
│   │
│   ├── middleware/
│   │   ├── auth.py
│   │   └── logging.py
│   │
│   └── utils/
│       ├── security.py
│       ├── validators.py
│       └── helpers.py
│
├── tests/
├── seed.py
├── requirements.txt
└── .env
```

---

# 8. MongoDB Database

Database name:

```text
complaint_management
```

Collections:

```text
users
complaints
categories
departments
staff
notifications
comments
attachments
feedback
audit_logs
system_settings
activity_logs
```

---

# 9. Users Collection

Collection:

```text
users
```

Fields:

```text
_id
name
email
phone
password_hash
role
department_id
profile_image
status
is_verified
created_at
updated_at
last_login
```

Example:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "user",
  "status": "active",
  "is_verified": true,
  "created_at": "2026-08-27T10:00:00"
}
```

---

# 10. Complaints Collection

Collection:

```text
complaints
```

Fields:

```text
_id
complaint_number
title
description
user_id
category_id
department_id
assigned_staff_id
priority
status
location
attachments
ai_category
ai_priority
ai_sentiment
ai_confidence
created_at
updated_at
assigned_at
resolved_at
closed_at
due_date
sla_status
```

Possible status values:

```text
submitted
under_review
assigned
in_progress
waiting_for_user
resolved
closed
reopened
rejected
```

Possible priority values:

```text
low
medium
high
critical
```

---

# 11. Categories Collection

Collection:

```text
categories
```

Fields:

```text
_id
name
description
department_id
priority
status
created_at
```

Example categories:

```text
Academic
Infrastructure
Hostel
Transport
Fees
IT Support
Library
Security
Food
Administration
Other
```

---

# 12. Departments Collection

Collection:

```text
departments
```

Fields:

```text
_id
name
code
description
head_id
status
created_at
```

Example:

```text
Computer Science
Mechanical
Civil
Electrical
Administration
Hostel
Transport
IT Support
```

---

# 13. Staff Collection

Collection:

```text
staff
```

Fields:

```text
_id
user_id
employee_id
department_id
designation
specialization
availability
current_workload
status
created_at
```

---

# 14. Comments Collection

Collection:

```text
comments
```

Fields:

```text
_id
complaint_id
user_id
message
attachments
created_at
updated_at
```

---

# 15. Notifications Collection

Collection:

```text
notifications
```

Fields:

```text
_id
user_id
title
message
type
is_read
reference_id
created_at
```

Notification types:

```text
complaint_created
complaint_assigned
status_updated
complaint_resolved
complaint_reopened
new_comment
sla_warning
sla_breach
system
```

---

# 16. Feedback Collection

Collection:

```text
feedback
```

Fields:

```text
_id
complaint_id
user_id
rating
comment
created_at
```

Rating:

```text
1
2
3
4
5
```

---

# 17. Audit Logs Collection

Collection:

```text
audit_logs
```

Fields:

```text
_id
user_id
action
entity
entity_id
old_value
new_value
ip_address
timestamp
```

---

# 18. Admin Dashboard

Create a professional admin dashboard.

The dashboard should have:

- Sidebar navigation.
- Top navbar.
- Profile menu.
- Notification dropdown.
- Search.
- Breadcrumbs.
- Responsive layout.
- Bootstrap styling.
- Cards.
- Tables.
- Charts.
- Filters.
- Export buttons.

---

# 19. Admin Dashboard Pages

Create at least 15 admin pages.

```text
1. Dashboard Overview
2. Complaint Management
3. Complaint Details
4. User Management
5. Staff Management
6. Department Management
7. Category Management
8. Priority Management
9. Analytics Dashboard
10. Reports
11. Notifications
12. Feedback Management
13. Audit Logs
14. System Settings
15. Admin Profile
```

---

# 20. Dashboard Overview Page

Route:

```text
/admin/dashboard
```

Display KPI cards:

```text
Total Complaints
Pending Complaints
In Progress
Resolved
Closed
Critical Complaints
Total Users
Active Staff
```

Display charts:

```text
Complaints by Status
Complaints by Priority
Complaints by Category
Complaints by Department
Monthly Complaint Trend
Resolution Rate
Average Resolution Time
```

Display:

```text
Recent Complaints
Recent Activities
Critical Complaints
Top Performing Departments
```

---

# 21. Complaint Management Page

Route:

```text
/admin/complaints
```

Features:

- Search.
- Pagination.
- Sorting.
- Filtering.
- Status filter.
- Priority filter.
- Department filter.
- Category filter.
- Date filter.
- Staff filter.
- Bulk selection.
- Bulk assignment.
- Bulk status update.
- Export CSV.
- Export PDF.

Table columns:

```text
Complaint ID
Title
User
Category
Department
Priority
Assigned Staff
Status
Created Date
Actions
```

---

# 22. Complaint Details Page

Route:

```text
/admin/complaints/:id
```

Display:

```text
Complaint information
User information
Category
Department
Priority
Current status
Assigned staff
Created date
Due date
Resolution date
Attachments
Comments
Activity timeline
```

Admin actions:

```text
Assign Staff
Change Priority
Change Status
Add Comment
Request Information
Resolve
Close
Reopen
Reject
```

---

# 23. User Management Page

Route:

```text
/admin/users
```

Features:

- Search users.
- Filter by role.
- Filter by status.
- View profile.
- Edit user.
- Disable user.
- Enable user.
- Delete user.
- Reset password.
- View complaint history.

Table:

```text
Name
Email
Phone
Role
Status
Complaints
Joined Date
Actions
```

---

# 24. Staff Management Page

Route:

```text
/admin/staff
```

Features:

- Add staff.
- Edit staff.
- Assign department.
- View workload.
- View assigned complaints.
- Activate/deactivate staff.
- Change designation.

Display:

```text
Staff Name
Employee ID
Department
Designation
Current Workload
Resolved Complaints
Average Resolution Time
Status
```

---

# 25. Department Management

Route:

```text
/admin/departments
```

Features:

- Create department.
- Edit department.
- Delete department.
- Assign department head.
- View complaint count.
- View resolution rate.
- View staff count.

Analytics:

```text
Department Complaint Volume
Department Resolution Rate
Department Average Response Time
Department Average Resolution Time
```

---

# 26. Category Management

Route:

```text
/admin/categories
```

Features:

- Add category.
- Edit category.
- Delete category.
- Assign department.
- Configure default priority.
- Activate/deactivate category.

---

# 27. Priority Management

Route:

```text
/admin/priorities
```

Priority levels:

```text
Low
Medium
High
Critical
```

Each priority should have:

```text
Name
Description
Response SLA
Resolution SLA
Escalation threshold
Status
```

Example:

```text
Critical
Response SLA: 1 hour
Resolution SLA: 24 hours
```

---

# 28. Analytics Dashboard

Route:

```text
/admin/analytics
```

This is one of the most important modules.

Provide advanced analytics.

Analytics should support:

```text
Today
7 Days
30 Days
90 Days
6 Months
1 Year
Custom Date Range
```

---

# 29. Analytics KPI Cards

Display:

```text
Total Complaints
New Complaints
Resolved Complaints
Pending Complaints
Resolution Rate
Average Resolution Time
Average Response Time
Reopened Complaints
Critical Complaints
Customer Satisfaction
```

---

# 30. Complaint Trend Analytics

Create a line chart.

X-axis:

```text
Date
```

Y-axis:

```text
Complaint Count
```

Show:

```text
Submitted
Resolved
Closed
Reopened
```

API:

```text
GET /api/analytics/complaint-trends
```

---

# 31. Status Analytics

Create a doughnut chart.

Statuses:

```text
Submitted
Under Review
Assigned
In Progress
Resolved
Closed
Reopened
Rejected
```

API:

```text
GET /api/analytics/status-distribution
```

---

# 32. Priority Analytics

Create a bar chart.

Show:

```text
Low
Medium
High
Critical
```

API:

```text
GET /api/analytics/priority-distribution
```

---

# 33. Category Analytics

Create a horizontal bar chart.

Show complaint counts by category.

Example:

```text
IT Support       320
Infrastructure   240
Hostel           180
Academic         150
Transport        110
Fees              80
```

API:

```text
GET /api/analytics/category-distribution
```

---

# 34. Department Analytics

Create a bar chart.

Metrics:

```text
Total Complaints
Resolved
Pending
Resolution Rate
```

API:

```text
GET /api/analytics/department-performance
```

---

# 35. Resolution Time Analytics

Calculate:

```text
Average Resolution Time
Median Resolution Time
Fastest Resolution
Longest Resolution
```

Display using cards and charts.

API:

```text
GET /api/analytics/resolution-time
```

---

# 36. SLA Analytics

Track service-level agreements.

Metrics:

```text
Within SLA
SLA Breached
At Risk
Critical SLA Breaches
```

Display:

```text
SLA Compliance Rate
```

API:

```text
GET /api/analytics/sla
```

---

# 37. Staff Performance Analytics

Show:

```text
Staff Name
Assigned Complaints
Resolved Complaints
Pending Complaints
Average Resolution Time
Customer Rating
SLA Compliance
```

API:

```text
GET /api/analytics/staff-performance
```

---

# 38. User Analytics

Show:

```text
Total Users
Active Users
New Users
Users with Complaints
Top Complaint Submitters
```

API:

```text
GET /api/analytics/users
```

---

# 39. Satisfaction Analytics

Use feedback data.

Metrics:

```text
Average Rating
5 Star
4 Star
3 Star
2 Star
1 Star
```

Create:

```text
Rating Distribution Chart
Satisfaction Trend Chart
```

API:

```text
GET /api/analytics/satisfaction
```

---

# 40. AI Analytics

Implement optional AI-powered analytics.

AI should identify:

```text
Most common complaint topics
Emerging complaint categories
Repeated complaints
High-risk complaints
Potential duplicate complaints
Negative sentiment
Urgent complaints
```

Display:

```text
AI Insights
```

Example:

```text
"IT-related complaints increased this month."

"Hostel complaints are concentrated in one department."

"Some complaints appear to be duplicates."

"Critical complaints increased during the last 7 days."
```

---

# 41. AI Complaint Classification

When a complaint is submitted:

```text
Complaint
    |
    v
AI Classification
    |
    ├── Category
    ├── Priority
    ├── Sentiment
    └── Confidence
```

Store:

```text
ai_category
ai_priority
ai_sentiment
ai_confidence
```

The admin should be able to override AI classification.

---

# 42. Duplicate Complaint Detection

When a new complaint is submitted:

```text
New Complaint
      |
      v
Compare Existing Complaints
      |
      v
Similarity Score
      |
      v
Possible Duplicate
```

Display:

```text
Possible Duplicate Complaints
Similarity: 87%
```

Admin can merge or ignore duplicate suggestions.

---

# 43. Complaint Assignment

Implement intelligent assignment.

Assignment factors:

```text
Department
Staff specialization
Current workload
Availability
Priority
Previous complaint category
```

Example:

```text
IT Complaint
+
Available IT Staff
+
Lowest Workload
=
Suggested Staff
```

Admin can accept or change assignment.

---

# 44. Notifications

Create notification system.

Events:

```text
Complaint submitted
Complaint assigned
Complaint status changed
Complaint resolved
Complaint reopened
New comment
SLA warning
SLA breach
```

Frontend should show notification count.

---

# 45. Reports Page

Route:

```text
/admin/reports
```

Reports:

```text
Daily Complaint Report
Weekly Complaint Report
Monthly Complaint Report
Department Report
Staff Performance Report
Category Report
SLA Report
User Report
Feedback Report
```

Export formats:

```text
CSV
Excel
PDF
```

---

# 46. Audit Logs

Route:

```text
/admin/audit-logs
```

Track:

```text
Login
Logout
Complaint created
Complaint updated
Status changed
Priority changed
Staff assigned
User created
User deleted
Settings changed
```

Columns:

```text
User
Action
Entity
Entity ID
Timestamp
IP Address
```

---

# 47. System Settings

Route:

```text
/admin/settings
```

Settings:

```text
Application Name
Email Settings
Complaint SLA
Notification Settings
File Upload Limits
Allowed File Types
Default Priority
Default Complaint Status
Maintenance Mode
```

---

# 48. Admin Profile

Route:

```text
/admin/profile
```

Features:

- View profile.
- Update name.
- Update phone.
- Change password.
- Upload profile image.
- View login history.

---

# 49. User Frontend Pages

Create:

```text
/login
/register
/forgot-password
/dashboard
/complaints
/complaints/create
/complaints/:id
/profile
/notifications
```

---

# 50. User Dashboard

Display:

```text
Total Complaints
Pending
In Progress
Resolved
Closed
```

Charts:

```text
My Complaint Status
My Complaint History
```

Recent complaints should be shown in a table.

---

# 51. Create Complaint Page

Fields:

```text
Title
Description
Category
Location
Attachment
```

The backend should automatically generate:

```text
Complaint Number
Priority
Department
AI Category
AI Sentiment
```

---

# 52. Staff Dashboard

Route:

```text
/staff/dashboard
```

Cards:

```text
Assigned Complaints
Pending
In Progress
Resolved
Overdue
```

Charts:

```text
Workload
Resolution Trend
Priority Distribution
```

---

# 53. Staff Complaint Page

Staff should see only assigned complaints.

Actions:

```text
Start Work
Update Status
Add Comment
Upload Evidence
Resolve Complaint
```

---

# 54. REST API Structure

Base URL:

```text
/api
```

Authentication:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

---

# 55. User APIs

```text
GET /api/users
GET /api/users/{id}
POST /api/users
PUT /api/users/{id}
DELETE /api/users/{id}
PATCH /api/users/{id}/status
GET /api/users/{id}/complaints
```

---

# 56. Complaint APIs

```text
GET /api/complaints
GET /api/complaints/{id}
POST /api/complaints
PUT /api/complaints/{id}
DELETE /api/complaints/{id}
PATCH /api/complaints/{id}/status
PATCH /api/complaints/{id}/priority
PATCH /api/complaints/{id}/assign
POST /api/complaints/{id}/comments
POST /api/complaints/{id}/resolve
POST /api/complaints/{id}/reopen
POST /api/complaints/{id}/close
```

---

# 57. Category APIs

```text
GET /api/categories
GET /api/categories/{id}
POST /api/categories
PUT /api/categories/{id}
DELETE /api/categories/{id}
PATCH /api/categories/{id}/status
```

---

# 58. Department APIs

```text
GET /api/departments
GET /api/departments/{id}
POST /api/departments
PUT /api/departments/{id}
DELETE /api/departments/{id}
GET /api/departments/{id}/analytics
```

---

# 59. Staff APIs

```text
GET /api/staff
GET /api/staff/{id}
POST /api/staff
PUT /api/staff/{id}
DELETE /api/staff/{id}
GET /api/staff/{id}/complaints
GET /api/staff/{id}/performance
```

---

# 60. Notification APIs

```text
GET /api/notifications
PATCH /api/notifications/{id}/read
PATCH /api/notifications/read-all
DELETE /api/notifications/{id}
```

---

# 61. Analytics APIs

Create:

```text
GET /api/analytics/overview
GET /api/analytics/complaint-trends
GET /api/analytics/status-distribution
GET /api/analytics/priority-distribution
GET /api/analytics/category-distribution
GET /api/analytics/department-performance
GET /api/analytics/resolution-time
GET /api/analytics/sla
GET /api/analytics/staff-performance
GET /api/analytics/users
GET /api/analytics/satisfaction
GET /api/analytics/ai-insights
```

---

# 62. Analytics Query Parameters

Analytics endpoints should support:

```text
start_date
end_date
department_id
category_id
priority
status
staff_id
```

Example:

```text
GET /api/analytics/complaint-trends?start_date=2026-08-01&end_date=2026-08-27
```

---

# 63. MongoDB Aggregation

Use MongoDB aggregation pipelines for analytics.

Use:

```text
$match
$group
$project
$sort
$count
$lookup
$unwind
```

Do not retrieve the entire complaints collection into Python for simple aggregation.

Use MongoDB aggregation for dashboard statistics.

---

# 64. Dashboard API Response

Example:

```json
{
  "total_complaints": 1250,
  "pending": 320,
  "in_progress": 210,
  "resolved": 580,
  "closed": 140,
  "critical": 45,
  "resolution_rate": 57.6,
  "average_resolution_hours": 31.4
}
```

---

# 65. Complaint Trend Response

```json
{
  "labels": [
    "Aug 1",
    "Aug 2",
    "Aug 3",
    "Aug 4"
  ],
  "submitted": [
    20,
    35,
    28,
    42
  ],
  "resolved": [
    15,
    21,
    30,
    25
  ]
}
```

---

# 66. Bootstrap UI

Use Bootstrap 5 throughout the application.

Required components:

```text
Navbar
Sidebar
Cards
Tables
Forms
Modals
Dropdowns
Badges
Alerts
Pagination
Tabs
Progress bars
Breadcrumbs
Offcanvas
Toast
Spinner
```

---

# 67. Admin Sidebar

Sidebar menu:

```text
Dashboard
Complaints
Users
Staff
Departments
Categories
Priorities
Analytics
Reports
Notifications
Feedback
Audit Logs
Settings
Profile
Logout
```

---

# 68. Dashboard Design

Use a professional SaaS dashboard design.

Layout:

```text
------------------------------------------------
Sidebar | Top Navbar
        |---------------------------------------
        | KPI Cards
        |---------------------------------------
        | Charts
        |---------------------------------------
        | Recent Complaints
        |---------------------------------------
        | Activity Feed
------------------------------------------------
```

---

# 69. Search

Global complaint search should support:

```text
Complaint ID
Title
Description
User
Category
Department
```

Use debounced search from React.

---

# 70. Pagination

Backend pagination:

```text
?page=1&limit=20
```

Response:

```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 150,
  "pages": 8
}
```

---

# 71. Filtering

Complaint filtering:

```text
status
priority
category
department
staff
date range
```

Filters must be sent to the backend.

---

# 72. Sorting

Support:

```text
created_at
priority
status
updated_at
due_date
```

Example:

```text
?sort_by=created_at&sort_order=desc
```

---

# 73. File Upload

Allow attachments.

Supported formats:

```text
jpg
jpeg
png
pdf
doc
docx
```

Maximum size should be configurable.

Store metadata:

```text
filename
file_type
file_size
uploaded_by
complaint_id
uploaded_at
```

---

# 74. Security Requirements

Implement:

```text
JWT authentication
Password hashing
Role-based authorization
Input validation
File validation
CORS configuration
Environment variables
Secure error handling
Rate limiting
Audit logging
```

Never store plain-text passwords.

Never expose secret keys in React.

---

# 75. Environment Variables

Backend `.env`:

```text
MONGODB_URI=
DATABASE_NAME=
JWT_SECRET=
JWT_ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
CORS_ORIGINS=
UPLOAD_DIR=
AI_API_KEY=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USERNAME=
EMAIL_PASSWORD=
```

---

# 76. Error Handling

FastAPI should return consistent errors.

Example:

```json
{
  "success": false,
  "message": "Complaint not found",
  "error_code": "COMPLAINT_NOT_FOUND"
}
```

Frontend should display Bootstrap alerts/toasts.

---

# 77. API Response Standard

Successful response:

```json
{
  "success": true,
  "message": "Complaint created successfully",
  "data": {}
}
```

Failed response:

```json
{
  "success": false,
  "message": "Invalid request",
  "errors": []
}
```

---

# 78. Loading States

Every API-driven page must support:

```text
Loading spinner
Skeleton loading
Empty state
Error state
Retry button
```

---

# 79. Empty States

Examples:

```text
No complaints found.
No users found.
No notifications.
No analytics data available.
No staff assigned.
```

---

# 80. Toast Notifications

Use Bootstrap toast notifications for:

```text
Create success
Update success
Delete success
Status update
Assignment success
Login success
API error
Validation error
```

---

# 81. Confirmation Modals

Use confirmation modals before:

```text
Delete user
Delete complaint
Delete category
Deactivate staff
Reject complaint
Close complaint
```

---

# 82. Activity Timeline

Complaint details must include timeline:

```text
Complaint Created
      |
Assigned
      |
Under Review
      |
In Progress
      |
Comment Added
      |
Resolved
      |
Closed
```

---

# 83. SLA Engine

Each complaint should have:

```text
created_at
due_date
sla_status
```

Possible SLA status:

```text
within_sla
at_risk
breached
```

Automatically calculate SLA status.

---

# 84. Escalation

If complaint approaches SLA limit:

```text
Send warning notification.
```

If SLA is breached:

```text
Notify administrator.
Mark complaint as SLA breached.
Create audit event.
```

---

# 85. Analytics Tools

Use these analytics tools:

## Chart.js

For:

```text
Line charts
Bar charts
Doughnut charts
Radar charts
Area-style charts
```

## MongoDB Aggregation

For:

```text
Grouping
Counting
Filtering
Time-based analysis
Department statistics
Category statistics
```

## Python

Use Python for:

```text
Average resolution time
Median resolution time
SLA percentage
Trend calculations
AI preprocessing
```

---

# 86. Chart Components

Create reusable React components:

```text
ComplaintTrendChart.jsx
StatusChart.jsx
PriorityChart.jsx
CategoryChart.jsx
DepartmentChart.jsx
ResolutionChart.jsx
SLAChart.jsx
StaffPerformanceChart.jsx
SatisfactionChart.jsx
```

---

# 87. Analytics Folder

```text
src/charts/
├── ComplaintTrendChart.jsx
├── StatusChart.jsx
├── PriorityChart.jsx
├── CategoryChart.jsx
├── DepartmentChart.jsx
├── ResolutionChart.jsx
├── SLAChart.jsx
├── StaffPerformanceChart.jsx
└── SatisfactionChart.jsx
```

---

# 88. Analytics Service

Backend:

```text
services/
└── analytics_service.py
```

Functions:

```text
get_dashboard_overview()
get_complaint_trends()
get_status_distribution()
get_priority_distribution()
get_category_distribution()
get_department_performance()
get_resolution_metrics()
get_sla_metrics()
get_staff_performance()
get_user_metrics()
get_satisfaction_metrics()
get_ai_insights()
```

---

# 89. AI Service

Create:

```text
services/ai_service.py
```

Functions:

```text
classify_complaint()
predict_priority()
detect_sentiment()
calculate_similarity()
generate_insights()
```

AI should be optional.

The application must still work if an AI API is unavailable.

---

# 90. AI Fallback

If AI service fails:

```text
Use default category.
Use default priority.
Continue complaint creation.
Log AI failure.
```

Never block complaint submission because of AI failure.

---

# 91. Duplicate Detection

Store:

```text
duplicate_score
possible_duplicate_ids
```

Only flag complaints when similarity crosses a configurable threshold.

Example:

```text
threshold = 0.80
```

---

# 92. Audit System

Every important admin action should create an audit log.

Example:

```json
{
  "action": "UPDATE_COMPLAINT_STATUS",
  "entity": "complaint",
  "entity_id": "CMP-10234",
  "old_value": "in_progress",
  "new_value": "resolved"
}
```

---

# 93. Testing

Backend testing:

```text
pytest
```

Test:

```text
Authentication
Authorization
Complaint creation
Complaint update
Complaint assignment
Status changes
Analytics APIs
User management
```

Frontend testing:

```text
React Testing Library
```

Test:

```text
Login
Dashboard
Complaint form
Filters
Tables
Admin navigation
```

---

# 94. API Documentation

FastAPI automatically provides:

```text
/docs
/redoc
```

Ensure every API has:

```text
Summary
Description
Request schema
Response schema
Error responses
Authentication requirements
```

---

# 95. Git Structure

Repository:

```text
ai-complaint-management-system/
│
├── frontend/
├── backend/
├── docs/
├── screenshots/
├── README.md
├── .gitignore
└── docker-compose.yml
```

---

# 96. README Requirements

README should contain:

```text
Project Overview
Features
Technology Stack
Architecture
Installation
Environment Variables
Database Setup
Frontend Setup
Backend Setup
API Documentation
Screenshots
Admin Features
Analytics
AI Features
Testing
Deployment
Future Enhancements
```

---

# 97. Seed Data

Create a seed script.

Seed:

```text
1 Super Admin
2 Admins
10 Staff
50 Users
10 Categories
6 Departments
100 Sample Complaints
Sample Feedback
Sample Notifications
```

Credentials should be documented only for local development.

---

# 98. Sample Admin Account

Create development-only account:

```text
Email:
admin@example.com

Password:
Admin@123
```

Do not use this password in production.

---

# 99. Sample Dashboard Data

Use realistic demo data.

Example:

```text
Total Complaints: 1250
Pending: 320
In Progress: 210
Resolved: 580
Closed: 140
Critical: 45
Resolution Rate: 57.6%
Average Resolution Time: 31.4 hours
```

---

# 100. Performance Requirements

Frontend:

```text
Lazy load pages
Debounce search
Avoid unnecessary API calls
Memoize expensive components
```

Backend:

```text
Use MongoDB indexes
Use aggregation pipelines
Paginate large collections
Avoid unnecessary queries
```

---

# 101. MongoDB Indexes

Create indexes for:

```text
users.email
users.role
complaints.complaint_number
complaints.status
complaints.priority
complaints.category_id
complaints.department_id
complaints.assigned_staff_id
complaints.created_at
notifications.user_id
audit_logs.user_id
audit_logs.timestamp
```

---

# 102. Database Relationships

Maintain logical references:

```text
User
 |
 └── Complaint
       |
       ├── Category
       ├── Department
       ├── Staff
       ├── Comments
       ├── Attachments
       └── Feedback
```

Use MongoDB ObjectId references.

---

# 103. Complaint Lifecycle

Implement:

```text
SUBMITTED
    |
    v
UNDER REVIEW
    |
    v
ASSIGNED
    |
    v
IN PROGRESS
    |
    v
RESOLVED
    |
    v
CLOSED
```

Alternative:

```text
IN PROGRESS
     |
     v
WAITING FOR USER
     |
     v
IN PROGRESS
```

Reopening:

```text
CLOSED
  |
  v
REOPENED
  |
  v
IN PROGRESS
```

---

# 104. Admin Workflow

```text
Admin Login
     |
     v
Dashboard
     |
     v
View Critical Complaints
     |
     v
Open Complaint
     |
     v
Review AI Classification
     |
     v
Assign Staff
     |
     v
Monitor SLA
     |
     v
Staff Resolves
     |
     v
User Gives Feedback
     |
     v
Analytics Updated
```

---

# 105. Analytics Dashboard Layout

```text
----------------------------------------------------
| Total | Pending | Resolved | SLA | Satisfaction |
----------------------------------------------------
|              Complaint Trend                     |
----------------------------------------------------
| Status Distribution | Priority Distribution      |
----------------------------------------------------
| Category Analysis   | Department Performance     |
----------------------------------------------------
| Resolution Time     | SLA Performance            |
----------------------------------------------------
| Staff Performance   | Satisfaction              |
----------------------------------------------------
| AI Insights                                      |
----------------------------------------------------
```

---

# 106. Date Range Filter

Analytics page should have:

```text
Today
Yesterday
Last 7 Days
Last 30 Days
Last 90 Days
This Year
Custom
```

Changing date range must refresh all charts.

---

# 107. Analytics Export

Allow export of analytics.

Buttons:

```text
Export CSV
Export PDF
Print Report
```

The export should respect currently selected filters.

---

# 108. Admin Dashboard UX

Follow these rules:

```text
Clean UI
Consistent spacing
Readable typography
Responsive Bootstrap layout
Minimal unnecessary animations
Clear status badges
Consistent buttons
Accessible forms
```

---

# 109. Status Badge Mapping

Use Bootstrap contextual classes.

```text
submitted      -> info
under_review   -> secondary
assigned       -> primary
in_progress    -> warning
waiting_user   -> secondary
resolved       -> success
closed         -> dark
reopened       -> warning
rejected       -> danger
```

---

# 110. Priority Badge Mapping

```text
low      -> success
medium   -> info
high     -> warning
critical -> danger
```

---

# 111. API Authentication

Protected endpoints must require:

```text
Authorization: Bearer <JWT>
```

Admin endpoints should verify:

```text
role in ["admin", "super_admin"]
```

Staff endpoints should verify:

```text
role == "staff"
```

User endpoints should verify ownership.

---

# 112. Ownership Security

A normal user must not be able to:

```text
View another user's complaint
Update another user's complaint
Delete another user's complaint
View admin analytics
View audit logs
```

---

# 113. Admin Security

Admin users must not expose:

```text
JWT secret
Database credentials
AI API key
Email password
Environment variables
```

---

# 114. Logging

Backend logs should include:

```text
Timestamp
Request method
Endpoint
User ID
Status code
Execution time
Error
```

Never log passwords or tokens.

---

# 115. Frontend Services

Create:

```text
services/
├── api.js
├── authService.js
├── complaintService.js
├── userService.js
├── staffService.js
├── departmentService.js
├── categoryService.js
├── notificationService.js
├── analyticsService.js
└── reportService.js
```

---

# 116. Axios Configuration

Create centralized Axios configuration.

Features:

```text
Base URL
JWT injection
401 handling
Error handling
Request timeout
```

---

# 117. React Context

Create:

```text
AuthContext
NotificationContext
```

AuthContext should store:

```text
user
role
isAuthenticated
login()
logout()
```

---

# 118. Protected Routes

Create:

```text
ProtectedRoute
AdminRoute
StaffRoute
UserRoute
```

Example:

```text
/admin/*
```

should only be accessible by administrators.

---

# 119. RESPONSIVE DESIGN — MANDATORY

The entire application MUST be fully responsive.

The application must provide a consistent and usable experience across:

- Desktop
- Laptop
- Tablet
- Mobile
- Small mobile devices
- Large desktop monitors

Responsive design is a mandatory acceptance criterion.

The application MUST NOT have:

- Horizontal scrolling on normal pages
- Overlapping components
- Cut-off text
- Broken charts
- Broken tables
- Buttons going outside containers
- Sidebar covering content
- Forms extending beyond screen width
- Fixed-width layouts that break on mobile

---

# 120. Responsive Breakpoints

Use Bootstrap 5 responsive breakpoints.

```text
xs  < 576px
sm  >= 576px
md  >= 768px
lg  >= 992px
xl  >= 1200px
xxl >= 1400px
```

Test at:

```text
360px
375px
390px
414px
576px
768px
992px
1200px
1366px
1440px
1920px
```

---

# 121. Responsive Admin Layout

Desktop:

```text
---------------------------------------------------------
| Sidebar |              Top Navbar                     |
|         |---------------------------------------------|
|         | KPI Cards                                   |
|         |---------------------------------------------|
|         | Charts                                      |
|         |---------------------------------------------|
|         | Tables                                      |
---------------------------------------------------------
```

Tablet:

```text
-----------------------------------------
| ☰ | Top Navbar                       |
-----------------------------------------
| KPI Cards                            |
-----------------------------------------
| Charts                               |
-----------------------------------------
| Tables                               |
-----------------------------------------
```

Mobile:

```text
--------------------------------
| ☰ | Logo | Notification | Profile |
--------------------------------
| KPI Card                     |
--------------------------------
| KPI Card                     |
--------------------------------
| Chart                        |
--------------------------------
| Recent Complaints            |
--------------------------------
```

---

# 122. Responsive Sidebar

Desktop:

```text
Sidebar visible
Width approximately 250px
Main content uses remaining width
```

Tablet:

```text
Sidebar collapses
Use hamburger menu
Bootstrap Offcanvas
```

Mobile:

```text
Sidebar hidden by default
Hamburger opens Offcanvas
Click outside closes sidebar
Navigation remains accessible
```

Do not create a sidebar that permanently consumes mobile screen width.

---

# 123. Responsive Navbar

Desktop:

```text
Logo
Search
Notifications
Profile
```

Mobile:

```text
Hamburger
Logo
Notifications
Profile
```

Search should move into a separate row or expandable section on mobile.

Navbar elements must never overflow the screen.

---

# 124. Responsive KPI Cards

Desktop:

```text
4 cards per row
```

Tablet:

```text
2 cards per row
```

Mobile:

```text
1 card per row
```

Use:

```text
col-12 col-sm-6 col-lg-3
```

---

# 125. Responsive Charts

All Chart.js charts MUST be responsive.

Use:

```javascript
options: {
    responsive: true,
    maintainAspectRatio: false
}
```

Use responsive containers:

```css
.chart-container {
    position: relative;
    width: 100%;
    height: 350px;
}
```

Mobile chart height:

```text
250px - 300px
```

Desktop chart height:

```text
350px - 450px
```

---

# 126. Responsive Analytics Dashboard

Desktop:

```text
------------------------------------------------
| KPI | KPI | KPI | KPI                        |
------------------------------------------------
|         Complaint Trend                      |
------------------------------------------------
| Status Chart | Priority Chart                |
------------------------------------------------
| Category     | Department                    |
------------------------------------------------
| SLA          | Staff Performance             |
------------------------------------------------
```

Tablet:

```text
--------------------------------
| KPI | KPI                    |
--------------------------------
| KPI | KPI                    |
--------------------------------
| Complaint Trend              |
--------------------------------
| Status Chart                 |
--------------------------------
| Priority Chart               |
--------------------------------
```

Mobile:

```text
--------------------------------
| KPI                          |
--------------------------------
| KPI                          |
--------------------------------
| KPI                          |
--------------------------------
| KPI                          |
--------------------------------
| Complaint Trend              |
--------------------------------
| Status Distribution          |
--------------------------------
| Priority Distribution        |
--------------------------------
```

---

# 127. Responsive Tables

Large tables MUST NOT break mobile layouts.

Use:

```html
<div className="table-responsive">
    <table className="table">
        ...
    </table>
</div>
```

Tables must support horizontal scrolling inside the table container only.

The entire page must NOT horizontally scroll.

---

# 128. Mobile Table Strategy

Desktop:

```text
Complaint ID
Title
User
Category
Department
Priority
Staff
Status
Date
Actions
```

Mobile should prioritize:

```text
Complaint ID
Title
Priority
Status
Actions
```

Less important information can be:

```text
Hidden
Moved into details
Shown inside expandable row
```

---

# 129. Responsive Complaint Details

Desktop:

```text
------------------------------------------------
| Complaint Information | User Information     |
------------------------------------------------
| Description                                  |
------------------------------------------------
| Attachments                                  |
------------------------------------------------
| Activity Timeline                            |
------------------------------------------------
| Comments                                     |
------------------------------------------------
```

Mobile:

```text
--------------------------------
| Complaint Information         |
--------------------------------
| User Information              |
--------------------------------
| Description                   |
--------------------------------
| Attachments                   |
--------------------------------
| Timeline                      |
--------------------------------
| Comments                      |
--------------------------------
```

All sections must become single-column on mobile.

---

# 130. Responsive Forms

Use Bootstrap responsive grid.

Desktop:

```text
Title              Category
Description        Department
Priority           Location
Attachment
```

Mobile:

```text
Title
Category
Description
Department
Priority
Location
Attachment
```

Use:

```text
col-12 col-md-6
```

Never use fixed widths for form inputs.

---

# 131. Responsive Modals

Use Bootstrap modals.

```text
.modal-dialog
.modal-dialog-centered
.modal-dialog-scrollable
```

For large forms:

```text
.modal-lg
```

Modal content must remain scrollable if it exceeds viewport height.

---

# 132. Responsive Filter Panel

Desktop:

```text
Search
Status
Priority
Category
Department
Staff
Date
Apply
Reset
```

Mobile:

```text
Search
Filter button
Offcanvas filter panel
Status
Priority
Category
Department
Staff
Date
Apply
Reset
```

Do not display many filter fields in one horizontal row on mobile.

---

# 133. Responsive Search

Search field must:

```text
Use full available width
Support mobile keyboard
Have adequate height
Have clear button
Use debounce
```

---

# 134. Responsive Buttons

Buttons must not overflow.

Desktop:

```text
[Add Complaint] [Export] [Assign]
```

Mobile:

```text
[Add Complaint]
[Export]
[Assign]
```

Button groups should wrap:

```css
.button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
```

---

# 135. Responsive Action Menus

Desktop:

```text
View | Edit | Assign | Delete
```

Mobile:

```text
[ ⋮ ]
```

Use Bootstrap dropdown menus.

---

# 136. Responsive Typography

Desktop:

```text
Dashboard title: 28px-32px
Section title: 20px-24px
Body: 14px-16px
```

Mobile:

```text
Dashboard title: 22px-26px
Section title: 18px-20px
Body: 14px-16px
```

---

# 137. Responsive Spacing

Use Bootstrap responsive utilities:

```text
p-2 p-md-4
m-2 m-md-4
gap-2 gap-md-4
```

---

# 138. Responsive User Dashboard

Cards:

```text
Total Complaints
Pending
In Progress
Resolved
```

Mobile:

```text
1 card per row
```

Tablet:

```text
2 cards per row
```

Desktop:

```text
4 cards per row
```

---

# 139. Responsive Staff Dashboard

Staff dashboard must contain:

```text
Assigned Complaints
Pending
In Progress
Resolved
Overdue
```

Charts and tables must stack vertically on mobile.

---

# 140. Responsive Login Page

Login page must work from 320px width and above.

Desktop:

```text
---------------------------------------
| Branding | Login Form              |
---------------------------------------
```

Mobile:

```text
-------------------------
| Branding              |
| Login Form            |
-------------------------
```

Login form width:

```text
Desktop: 400px maximum
Mobile: 100% minus safe padding
```

---

# 141. Responsive Register Page

Desktop:

```text
Name          Email
Phone         Password
Department    Role
```

Mobile:

```text
Name
Email
Phone
Password
Department
Role
```

Use:

```text
col-12 col-md-6
```

---

# 142. Responsive Profile

Desktop:

```text
Profile Image | Personal Information
              | Security Settings
```

Mobile:

```text
Profile Image
Personal Information
Security Settings
```

---

# 143. Responsive Notifications

Desktop:

```text
Notification dropdown
```

Mobile:

```text
Notification page
```

Each notification should be a full-width responsive card.

---

# 144. Responsive Reports

Desktop:

```text
Date | Department | Category | Status | Export
```

Mobile:

```text
Date
Department
Category
Status
Export
```

---

# 145. Responsive Audit Logs

Desktop:

```text
User
Action
Entity
Entity ID
IP
Timestamp
```

Mobile:

```text
User
Action
Timestamp
```

Additional information can be shown through a View Details action.

---

# 146. Responsive Settings

Desktop:

```text
General Settings | Notification Settings
Security Settings | SLA Settings
```

Mobile:

```text
General Settings
Notification Settings
Security Settings
SLA Settings
```

---

# 147. Responsive Components

Create reusable components:

```text
ResponsiveSidebar.jsx
ResponsiveNavbar.jsx
ResponsiveTable.jsx
ResponsiveFilter.jsx
ResponsiveKpiCard.jsx
ResponsiveChartCard.jsx
ResponsiveModal.jsx
ResponsiveActionMenu.jsx
```

---

# 148. Responsive CSS

Create:

```text
src/styles/
├── global.css
├── responsive.css
├── dashboard.css
├── tables.css
└── forms.css
```

Use CSS media queries only where Bootstrap utilities are insufficient.

---

# 149. Mobile CSS

```css
@media (max-width: 767.98px) {
    /* mobile styles */
}
```

Tablet:

```css
@media (min-width: 768px) and (max-width: 991.98px) {
    /* tablet styles */
}
```

Desktop:

```css
@media (min-width: 992px) {
    /* desktop styles */
}
```

---

# 150. Prevent Horizontal Overflow

Use:

```css
html,
body {
    max-width: 100%;
    overflow-x: hidden;
}
```

Components must still be implemented correctly so content does not overflow.

Do not use this rule as a workaround for broken components.

---

# 151. Responsive Images

All images must be responsive.

Use:

```css
img {
    max-width: 100%;
    height: auto;
}
```

Profile images should use:

```text
object-fit: cover
```

---

# 152. Responsive Attachments

Uploaded files should be displayed responsively.

Images:

```text
Responsive preview
```

PDF:

```text
File card
Filename
File size
Open button
```

Do not display fixed-width previews.

---

# 153. Responsive Activity Timeline

Desktop:

```text
● Complaint Created
│
● Assigned
│
● In Progress
│
● Resolved
```

Mobile:

```text
● Complaint Created
│
● Assigned
│
● In Progress
│
● Resolved
```

Timeline text must wrap naturally.

---

# 154. Responsive Accessibility

Ensure:

```text
Buttons are touch-friendly
Inputs have labels
Icons have accessible labels
Keyboard navigation works
Focus states are visible
Color is not the only status indicator
```

Minimum touch target:

```text
44px × 44px
```

where practical.

---

# 155. Responsive Performance

On mobile:

```text
Lazy load charts
Lazy load images
Avoid unnecessary API calls
Debounce search
Paginate tables
Do not load huge datasets
```

Analytics should request only required data.

---

# 156. Responsive API Behavior

Backend APIs should support pagination.

Example:

```text
GET /api/complaints?page=1&limit=10
```

Desktop can request:

```text
limit=20
```

Mobile can request:

```text
limit=10
```

Do not send thousands of records to mobile browsers.

---

# 157. Responsive Dashboard Loading

Use skeletons instead of blank spaces.

Desktop:

```text
[████████] [████████] [████████] [████████]
```

Mobile:

```text
[████████████████]
[████████████████]
```

---

# 158. Responsive Empty State

Example:

```text
No complaints found

Try changing your filters or search criteria.
```

The empty state must be centered and responsive.

---

# 159. Responsive Error State

Example:

```text
Unable to load complaints

[ Retry ]
```

The error container should not exceed viewport width.

---

# 160. Mobile Navigation Requirements

On mobile:

```text
Hamburger menu
Dashboard
Complaints
Users
Staff
Analytics
Reports
Settings
Logout
```

The menu must close automatically after navigation.

---

# 161. Responsive Charts — Mobile Rules

Avoid charts with too many labels.

For mobile:

```text
Limit visible labels
Rotate labels when necessary
Use tooltips
Allow chart resizing
Reduce legend size
```

---

# 162. Responsive Analytics Cards

Analytics cards should support:

```text
Current value
Percentage change
Previous period
Trend indicator
```

Example:

```text
Resolution Rate

57.6%
↑ 8.4%

Compared with previous month
```

---

# 163. Responsive Data Visualization

Charts must never:

```text
Overflow card
Cover legends
Cut off axis labels
Overlap other charts
```

Use:

```text
width: 100%
height: responsive
```

---

# 164. Responsive Dashboard Grid

Use Bootstrap:

```text
row
g-3
g-md-4
```

Examples:

```text
col-12 col-md-6 col-xl-3
```

For charts:

```text
col-12 col-xl-8
col-12 col-xl-4
```

---

# 165. Responsive Final Acceptance Criteria

The project will NOT be considered complete unless it passes responsive testing.

Test:

```text
[ ] 360px mobile
[ ] 375px mobile
[ ] 390px mobile
[ ] 414px mobile
[ ] 576px
[ ] 768px tablet
[ ] 992px desktop
[ ] 1200px desktop
[ ] 1366px desktop
[ ] 1440px desktop
[ ] 1920px large desktop
```

Verify:

```text
[ ] No unwanted horizontal page scrolling
[ ] Sidebar works on mobile
[ ] Navbar works on mobile
[ ] KPI cards stack correctly
[ ] Charts resize correctly
[ ] Tables remain usable
[ ] Filters become mobile-friendly
[ ] Forms stack correctly
[ ] Modals fit mobile screens
[ ] Buttons remain accessible
[ ] Text does not overflow
[ ] Images resize correctly
[ ] Dashboard remains usable
[ ] Login works on mobile
[ ] User dashboard works on mobile
[ ] Staff dashboard works on mobile
[ ] Admin dashboard works on mobile
[ ] Analytics works on mobile
[ ] Reports work on mobile
[ ] Settings work on mobile
```

---

# 166. Final Project Quality

The final application should look like a modern responsive SaaS dashboard.

It should NOT look like a desktop website squeezed into mobile.

It should behave like:

```text
Desktop
   ↓
Optimized Desktop Layout

Tablet
   ↓
Optimized Tablet Layout

Mobile
   ↓
Optimized Mobile Layout
```

Every major component must adapt based on viewport size.

Responsive behavior must be implemented using:

```text
Bootstrap 5 Grid
Bootstrap Utilities
Bootstrap Offcanvas
Bootstrap Responsive Tables
CSS Media Queries
Responsive Chart.js
Flexible CSS
```

The responsive experience is a CORE FEATURE of the project.

---

# 167. Final-Year Project Presentation

Prepare the project so it can be explained in a viva.

Important modules:

```text
Problem Statement
Existing System
Proposed System
Objectives
System Architecture
Technology Stack
Database Design
API Architecture
Authentication
Complaint Workflow
AI Module
Analytics Module
Admin Dashboard
Testing
Results
Future Enhancements
```

---

# 168. Future Enhancements

Potential future features:

```text
Mobile application
WhatsApp notifications
Email automation
Real-time WebSocket updates
Advanced AI chatbot
Voice complaint submission
Multilingual complaints
Computer vision for image complaints
Predictive complaint forecasting
Advanced fraud detection
Microservices architecture
Cloud deployment
```

---

# 169. Coding Standards

Backend:

```text
PEP8
Type hints
Pydantic models
Service layer
Router layer
Reusable utilities
Clear exception handling
```

Frontend:

```text
Reusable components
Functional components
Hooks
Clean state management
Reusable API services
No duplicated API logic
```

---

# 170. Final Folder Structure

```text
ai-complaint-management-system/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── admin/
│   │   ├── user/
│   │   ├── staff/
│   │   ├── components/
│   │   ├── charts/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── database.py
│   │   ├── config.py
│   │   └── main.py
│   ├── tests/
│   ├── seed.py
│   ├── requirements.txt
│   └── .env
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   └── project-report.md
│
├── screenshots/
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

# 171. Implementation Order

Build the application in this order:

```text
Phase 1
Project setup

Phase 2
MongoDB connection

Phase 3
Authentication

Phase 4
User roles

Phase 5
Complaint CRUD

Phase 6
Admin dashboard

Phase 7
Staff management

Phase 8
Departments and categories

Phase 9
Notifications

Phase 10
SLA system

Phase 11
Analytics

Phase 12
AI features

Phase 13
Reports

Phase 14
Audit logs

Phase 15
Testing

Phase 16
Deployment
```

---

# 172. Important Development Rules

Do NOT create a basic CRUD application.

All dashboard numbers and charts must come from MongoDB through FastAPI APIs.

Do not hardcode analytics.

Correct:

```text
GET /api/analytics/overview
```

and render returned values.

Do not put all business logic inside FastAPI route functions.

Use:

```text
Router
   ↓
Service
   ↓
Database
```

Create reusable frontend components rather than duplicating code.

---

# 173. Final Acceptance Criteria

The project is complete only when:

```text
[ ] React frontend runs successfully
[ ] FastAPI backend runs successfully
[ ] MongoDB connects successfully
[ ] User registration works
[ ] Login works
[ ] JWT authentication works
[ ] Role-based access works
[ ] User can create complaints
[ ] Admin can view complaints
[ ] Admin can assign complaints
[ ] Staff can update assigned complaints
[ ] Complaint lifecycle works
[ ] Notifications work
[ ] SLA calculation works
[ ] Analytics APIs work
[ ] Dashboard charts work
[ ] AI classification works or fallback works
[ ] Duplicate detection works
[ ] Reports work
[ ] Audit logs work
[ ] Responsive UI works on mobile
[ ] Responsive UI works on tablet
[ ] Responsive UI works on desktop
[ ] API documentation works
[ ] Seed data works
[ ] Tests are included
[ ] README is complete
```

---

# 174. Final Instruction to Antigravity

Generate the complete project according to this specification.

Do not generate a static UI-only prototype.

Implement:

- Complete React frontend
- Complete FastAPI backend
- MongoDB integration
- JWT authentication
- Role-based access
- 15 Admin Dashboard pages
- User dashboard
- Staff dashboard
- Complaint management
- AI classification
- AI priority prediction
- Duplicate detection
- Notifications
- SLA management
- Analytics dashboard
- Reports
- Audit logs
- Responsive Bootstrap UI
- API documentation
- Seed data
- Testing structure
- README
- Deployment configuration

Use React and Bootstrap 5 for the frontend.

Use Python FastAPI for the backend.

Use MongoDB as the primary database.

Use Chart.js for frontend analytics visualization.

Use MongoDB aggregation pipelines for dashboard analytics.

Keep the architecture modular and production-oriented.

Make the Admin Dashboard the primary highlight of the application.

Ensure all dashboard values are dynamically loaded from FastAPI.

Ensure all important operations are persisted in MongoDB.

Ensure the entire application is responsive from 360px mobile screens to 1920px desktop screens.

Ensure there is no unwanted horizontal page scrolling.

Ensure mobile navigation uses Bootstrap Offcanvas.

Ensure charts, tables, forms, cards, modals, filters, and dashboards adapt properly to screen size.

Ensure the project can be run locally with clear setup instructions.

Generate clean, readable, maintainable code suitable for a final-year engineering project and portfolio demonstration.
