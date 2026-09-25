# Smart Health Monitoring System

A responsive clinical monitoring dashboard for tracking patient vitals, identifying risk levels, and surfacing urgent care alerts in real time.

## What this project includes

- React + Vite frontend dashboard
- FastAPI backend for live monitoring APIs
- SQL-ready patient and reading storage layer
- ThingSpeak/Firebase-compatible sensor ingestion flow
- Real-time alert scoring and patient drill-down views
- Fallback demo mode for local development without a live database

## Project structure

```text
smart-health-monitoring-system/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── services/
│   │       └── monitoring_service.py
│   ├── .env.example
│   ├── requirements.txt
│   └── .venv/
├── src/
├── public/
├── .gitignore
├── package.json
├── vite.config.js
├── index.html
├── README.md
└── server.js
```

## Quick start

### 1) Backend setup

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2) Frontend setup

```powershell
npm install
npm run dev
```

The frontend runs on http://localhost:3002 and the API runs on http://localhost:8000.

## Environment configuration

Copy the sample environment file before using live integrations:

```powershell
cd backend
Copy-Item .env.example .env
```

Common values:

- MySQL connection settings
- ThingSpeak channel ID and read key
- Firebase URL override
- CORS origin settings for local frontend ports

## Main API endpoints

- GET /health
- GET /api/overview
- GET /api/patients
- GET /api/patients/{patient_id}
- GET /api/alerts
- GET /api/sensor/live
- POST /api/sensors/ingest
- POST /api/vitals

## Current behavior

The project supports:

- live monitoring dashboard metrics
- patient risk scoring
- alert cards with severity logic
- patient detail drill-downs
- IoT ingestion from ThingSpeak/Firebase-ready sources
- graceful fallback when MySQL is not available

## Recommended next upgrade

For a high-quality production deployment, connect a real MySQL instance, add a database-backed ingestion pipeline, enable secure environment variables, and deploy the backend and frontend to a managed hosting platform.
