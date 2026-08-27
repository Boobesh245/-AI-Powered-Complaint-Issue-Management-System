# AI-Powered Complaint & Issue Management System — System Architecture

## 1. System Overview
The **AI-Powered Complaint & Issue Management System** (SmartResolve) is an enterprise-grade full-stack web application designed for educational campuses, residential institutions, and corporate organizations. It streamlines complaint submission, intelligent automated triage, dynamic specialist allocation, SLA tracking, and deep aggregation analytics.

## 2. High-Level Architecture Diagram

```
+-------------------------------------------------------------------------------+
|                             CLIENT INTERFACES                                 |
|   +---------------------+   +---------------------+   +-------------------+   |
|   |   Admin Dashboard   |   |    Staff Portal     |   |    User Portal    |   |
|   |   (15 SaaS Pages)   |   |   (Workbench & SLA) |   | (Tickets & Rating)|   |
|   +---------------------+   +---------------------+   +-------------------+   |
|                                    | (Axios HTTP + JWT)                       |
+------------------------------------|------------------------------------------+
                                     v
+-------------------------------------------------------------------------------+
|                             FASTAPI REST BACKEND                              |
|   +-----------------------------------------------------------------------+   |
|   | Routers: Auth | Users | Complaints | Analytics | Reports | Staff | Depts   |   |
|   +-----------------------------------------------------------------------+   |
|   | Middleware: JWT Authentication | CORS | Role Authorization | Logging   |   |
|   +-----------------------------------------------------------------------+   |
|   | Services Layer:                                                       |   |
|   |   - AI NLP Classification Engine & TF-IDF Duplicate Detector          |   |
|   |   - MongoDB Aggregation Analytics Engine                              |   |
|   |   - Dynamic SLA Engine & Escalation Calculator                        |   |
|   |   - Notification & Security Audit Logging                             |   |
|   |   - ReportLab PDF & CSV Export Engine                                 |   |
|   +-----------------------------------------------------------------------+   |
+------------------------------------|------------------------------------------+
                                     v
+-------------------------------------------------------------------------------+
|                             MONGODB DATABASE                                  |
|   Collections: users | complaints | departments | categories | staff          |
|                comments | feedback | notifications | audit_logs | settings    |
+-------------------------------------------------------------------------------+
```

## 3. Key Components
1. **React Frontend (Vite + Bootstrap 5 + Chart.js)**
   - Responsive layouts adapting from 360px mobile viewport to desktop monitors.
   - Bootstrap Offcanvas navigation drawer on mobile and persistent sidebar on desktop.
   - Interactive Chart.js graphs for trends, status distributions, category rankings, and SLA metrics.

2. **FastAPI Backend (Python 3.12)**
   - High-throughput asynchronous routing.
   - Strict request/response validation with Pydantic v2.
   - Native Bcrypt password hashing and JWT bearer authorization.

3. **Built-in AI & NLP Engine**
   - Natural Language Processing tokenizer, term-frequency vectorizer, and cosine similarity for real-time duplicate ticket detection.
   - Automated category suggestion and urgency priority estimation.
   - Sentiment analysis flagging urgent and frustrated user messages.
