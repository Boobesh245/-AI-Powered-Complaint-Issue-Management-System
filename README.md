# AI-Powered Complaint & Issue Management System (SmartResolve)

A production-grade, enterprise full-stack web application designed for campus, institutional, and organizational issue tracking. Featuring automated AI complaint classification, duplicate detection, intelligent staff assignment, SLA tracking, and dynamic MongoDB aggregation analytics dashboards.

---

## 🌟 Key Features

### 1. 🤖 AI-Powered Intelligence
- **Automated NLP Classification**: Analyzes complaint title and description to predict appropriate category with confidence scoring.
- **Priority Estimation & Sentiment Analysis**: Detects urgent triggers (e.g., electrical hazards, leaks, outages, exams) and user frustration.
- **TF-IDF Duplicate Detection**: Computes semantic cosine similarity against historical complaints to prevent duplicate outage reports.
- **AI Trend Intelligence**: Aggregates top recurring problem topics and SLA risk alerts.

### 2. 📊 Executive Analytics Hub & Dashboard
- **10 KPI Metrics**: Total complaints, pending triage, in progress, resolved, resolution rate, SLA compliance %, avg resolution hours, customer satisfaction.
- **9 Dynamic Chart.js Visualizations**: Daily intake trend lines, status doughnuts, priority distributions, category bar rankings, department performance, SLA compliance pie charts, and satisfaction ratings.
- **MongoDB Aggregation Pipelines**: High-speed database-level aggregations (`$match`, `$group`, `$sort`, `$project`).

### 3. 🛡️ Role-Based Access Control (RBAC)
- **Super Admin**: Full platform configuration, user roles, system SLA thresholds, audit trail inspection.
- **Admin**: Complaint triage, manual/bulk staff allocation, category & department management, CSV/PDF report exports.
- **Staff Specialist**: Personal workbench, assigned queue management, status updating, work notes.
- **Student / User**: Issue reporting, attachment uploads, live discussion timeline, satisfaction rating.

### 4. 📱 Full Responsive SaaS Design
- Adaptable layouts tested from **360px mobile** up to **4K desktop** screens.
- **Bootstrap 5 Offcanvas** navigation drawer for mobile/tablet devices.
- Responsive data tables, chart containers, and modal dialogs with zero horizontal overflow.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Bootstrap 5, Bootstrap Icons, Chart.js, react-chartjs-2, Axios, React Router 6 |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, Uvicorn, PyMongo, PyJWT, Bcrypt, ReportLab (PDF) |
| **Database** | MongoDB 6+ (Indexed collections & aggregation pipelines) |
| **Testing** | Pytest, FastAPI TestClient, HTTPX |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (Node v22 recommended)
- **Python**: 3.11 or 3.12
- **MongoDB**: Running locally on `mongodb://localhost:27017` or MongoDB Atlas URI

---

### Step 1: Backend Setup & Seed Database

```bash
cd backend

# 1. Create Python virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Populate realistic demo dataset (63 users, 6 depts, 10 categories, 100 complaints)
python seed.py

# 5. Run backend automated tests
pytest

# 6. Start FastAPI backend server
uvicorn app.main:app --reload --port 8000
```
FastAPI server will be live at: **`http://localhost:8000`**
Interactive Swagger API documentation: **`http://localhost:8000/docs`**

---

### Step 2: Frontend Setup

```bash
cd frontend

# 1. Install frontend dependencies
npm install

# 2. Start Vite development server
npm run dev
```
Frontend application will be live at: **`http://localhost:5173`**

---

## 🌐 Deploy to Vercel (Frontend)

You can deploy the frontend directly to **Vercel** with 1 click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?s=https://github.com/Boobesh245/-AI-Powered-Complaint-Issue-Management-System)

### Deployment Steps:
1. Click the **Deploy with Vercel** button above or import your repository on [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. In **Environment Variables**, set:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com` (Your deployed backend API URL).
4. Click **Deploy**.

---

## 🔑 Default Demo Accounts

The login page includes **1-Click Demo Login Buttons** for testing all roles:

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@example.com` | `Admin@123` |
| **Operations Admin** | `admin.alex@example.com` | `Admin@123` |
| **Support Staff** | `david.staff@example.com` | `Staff@123` |
| **Student / User** | `james.smith1@example.com` | `User@123` |

---

## 📂 Project Architecture

```text
ai-complaint-management-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & lifespan configuration
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # PyMongo client & index management
│   │   ├── middleware/          # JWT authentication & logging
│   │   ├── models/ & schemas/   # Pydantic v2 schemas
│   │   ├── routers/             # Auth, Users, Complaints, Analytics, Reports...
│   │   ├── services/            # AI NLP, Analytics pipelines, SLA engine...
│   │   └── utils/               # Security, helpers, SLA calculators
│   ├── tests/                   # Automated pytest suite
│   ├── seed.py                  # Database seed generator
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── admin/               # 15 Admin dashboard pages
│   │   ├── user/                # User portal & create complaint form
│   │   ├── staff/               # Staff workbench
│   │   ├── charts/              # 9 Chart.js responsive components
│   │   ├── components/          # Navbar, Sidebar, StatCards, Timeline...
│   │   ├── context/             # Auth, Toast, Notification contexts
│   │   ├── services/            # Axios API clients
│   │   ├── styles/              # Global CSS, Dashboard, Responsive, Tables
│   │   └── App.jsx
│   └── package.json
├── docs/                        # Architecture, API, and Database documentation
├── docker-compose.yml
└── README.md
```

---

## 🧪 Testing

Run backend tests:
```bash
cd backend
.\venv\Scripts\pytest.exe
```

Run frontend build verification:
```bash
cd frontend
npm run build
```

---

## 📄 License
MIT License. Created for Academic Final-Year Project & Portfolio Demonstration.
