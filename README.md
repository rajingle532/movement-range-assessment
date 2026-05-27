# 🧠 ROM Rehab AI — Range of Motion Assessment Platform

An AI-powered Rehabilitation Therapy system designed to assess the **Range of Motion (ROM)** of patients using Computer Vision and real-time data streaming.

[![Tech Stack](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=flat&logo=react)](https://react.dev)
[![Tech Stack](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Tech Stack](https://img.shields.io/badge/CV-MediaPipe%20%2B%20OpenCV-FF6F00?style=flat)](https://mediapipe.dev)
[![Tech Stack](https://img.shields.io/badge/DB-SQLite%20%2B%20SQLAlchemy-003B57?style=flat)](https://www.sqlalchemy.org)

---

## 🚀 Overview

This platform allows physical therapists to:
- **Monitor patient movements in real-time** via webcam
- **Calculate joint angles** (Elbow Flexion, Knee Flexion, Shoulder Abduction) using **MediaPipe Pose Estimation**
- **Classify mobility status** — Normal / Mild Restriction / Severe Restriction
- **Register & manage patients** with a full clinical profile
- **Download PDF reports** per patient
- **Export patient data as CSV**
- **Track ROM recovery over time** via interactive area charts

---

## 🏗️ Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React 18 (Vite) + TailwindCSS — biopunk dark aesthetic |
| **Backend** | FastAPI (Python 3.10+) with async endpoints |
| **CV Engine** | MediaPipe Pose + OpenCV for skeleton tracking |
| **Streaming** | WebSocket (`ws://localhost:8000/ws/stream`) — 10 FPS |
| **Database** | SQLite with SQLAlchemy ORM |
| **Reports** | Server-side PDF generation via ReportLab |

---

## 📁 Project Structure

```text
movement-range-assessment/
├── backend/
│   ├── cv/           # MediaPipe pose estimation + angle calculation
│   ├── database/     # SQLAlchemy models and DB engine
│   ├── routers/      # FastAPI route handlers (patients, sessions, reports, stream, auth)
│   ├── schemas/      # Pydantic request/response schemas
│   ├── services/     # Business logic (pose processing, PDF generation)
│   ├── config.py     # App settings
│   ├── main.py       # FastAPI app entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, PatientCard, AngleGauge, JointTable, ProgressChart, SkeletonViewer
│   │   ├── hooks/        # useCamera, useWebSocket
│   │   ├── pages/        # Dashboard, Patients, LiveSession, Reports, Login
│   │   ├── services/     # api.js (Axios client)
│   │   ├── App.jsx       # Router + Protected routes
│   │   └── index.css     # Biopunk design system
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 🛠️ Setup Instructions

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- A webcam (for Live Session)

---

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create a virtual environment
python -m venv venv

# 3. Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. (Optional) Seed database with sample patients
python seed_db.py

# 6. Start the server
python main.py
# Backend runs at http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
# App runs at http://localhost:5173
```

---

## 🔑 Demo Credentials

| Field | Value |
|---|---|
| Email | `therapist@rom.com` |
| Password | `password123` |

---

## 📡 WebSocket API

The live session streams base64-encoded JPEG frames from the browser to the backend:

```
Client → WS: { "frame": "<base64-jpeg>" }
Server → WS: { "angles": { "elbow": 87.3, "knee": 142.1, "shoulder": 65.0 }, "status": { ... }, "annotated_frame": "<base64-jpeg>" }
```

---

## 📝 REST API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/auth/login` | User authentication |
| `GET` | `/api/patients/` | List all patients |
| `POST` | `/api/patients/` | Register new patient |
| `GET` | `/api/patients/export/csv` | Export all patients as CSV |
| `GET` | `/api/sessions/{patient_id}` | Get sessions for a patient |
| `POST` | `/api/sessions/` | Save a new session |
| `GET` | `/api/reports/{patient_id}` | Download PDF report |

---

## ✨ Key Features

- 🎥 **Real-time CV Pipeline** — MediaPipe Pose @ 10 FPS over WebSocket
- 📊 **Interactive ROM Charts** — Area charts with joint filter toggles
- 👥 **Patient Registry** — Add, search, and manage patient profiles
- 📄 **PDF Report Generation** — Per-patient clinical reports
- 🔐 **Auth Guard** — Protected routes with localStorage session
- 📱 **Fully Responsive** — Mobile hamburger nav with slide-out drawer
- 🎨 **Premium Design** — Biopunk dark UI with glassmorphism and glow animations
