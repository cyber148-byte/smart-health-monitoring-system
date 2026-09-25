from __future__ import annotations

from typing import Any, Dict, List

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import MySQLClient
from app.schemas import (
    AlertSummary,
    HealthOverview,
    PatientDetailResponse,
    PatientResponse,
    SensorReading,
    VitalEvaluation,
    VitalInput,
)
from app.services.monitoring_service import MonitoringService

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mysql = MySQLClient()

sample_patients: List[Dict[str, object]] = [
    {
        "id": "P-1024",
        "name": "Ava Thompson",
        "age": 29,
        "status": "Stable",
        "heartRate": 72,
        "oxygen": 98,
        "temperature": 98.6,
        "respiratoryRate": 16,
        "risk": 18,
        "alert": "Normal readings",
        "lastUpdated": "2 mins ago",
    },
    {
        "id": "P-2048",
        "name": "Daniel Brooks",
        "age": 47,
        "status": "Watch",
        "heartRate": 98,
        "oxygen": 94,
        "temperature": 99.4,
        "respiratoryRate": 20,
        "risk": 41,
        "alert": "Elevated blood pressure",
        "lastUpdated": "5 mins ago",
    },
    {
        "id": "P-3190",
        "name": "Maya Patel",
        "age": 63,
        "status": "Critical",
        "heartRate": 118,
        "oxygen": 91,
        "temperature": 100.8,
        "respiratoryRate": 24,
        "risk": 83,
        "alert": "Immediate attention required",
        "lastUpdated": "1 min ago",
    },
    {
        "id": "P-4217",
        "name": "Noah Kim",
        "age": 54,
        "status": "Stable",
        "heartRate": 69,
        "oxygen": 97,
        "temperature": 98.3,
        "respiratoryRate": 15,
        "risk": 22,
        "alert": "Recovery improving",
        "lastUpdated": "8 mins ago",
    },
    {
        "id": "P-5162",
        "name": "Sofia Martin",
        "age": 72,
        "status": "Watch",
        "heartRate": 101,
        "oxygen": 93,
        "temperature": 99.7,
        "respiratoryRate": 22,
        "risk": 58,
        "alert": "Oxygen trending lower",
        "lastUpdated": "3 mins ago",
    },
]


@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


@app.get(f"{settings.api_prefix}/overview", response_model=HealthOverview)
def get_overview() -> Dict[str, object]:
    patients = mysql.fetch_patients() or sample_patients
    overview = MonitoringService.build_overview(patients)
    return {
        "total_patients": overview["totalPatients"],
        "critical_patients": overview["criticalPatients"],
        "watch_patients": overview["watchPatients"],
        "average_heart_rate": overview["averageHeartRate"],
        "average_oxygen": overview["averageOxygen"],
        "active_alerts": overview["activeAlerts"],
        "update_time": overview["updateTime"],
    }


@app.get(f"{settings.api_prefix}/patients", response_model=list[PatientResponse])
def get_patients() -> List[Dict[str, object]]:
    patients = mysql.fetch_patients() or sample_patients
    return [
        {
            "id": patient.get("id"),
            "name": patient.get("name"),
            "age": patient.get("age"),
            "status": patient.get("status"),
            "heartRate": patient.get("heartRate"),
            "oxygen": patient.get("oxygen"),
            "temperature": patient.get("temperature"),
            "respiratoryRate": patient.get("respiratoryRate"),
            "risk": patient.get("risk"),
            "alert": patient.get("alert"),
            "lastUpdated": patient.get("lastUpdated") or "just now",
        }
        for patient in patients
    ]


@app.get(f"{settings.api_prefix}/patients/{{patient_id}}", response_model=PatientDetailResponse)
def get_patient_detail(patient_id: str) -> Dict[str, Any]:
    patient = mysql.fetch_patient_by_id(patient_id)
    if not patient:
        patient = next((item for item in sample_patients if item.get("id") == patient_id), None)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    history = mysql.fetch_patient_history(patient_id)
    if not history:
        history = [
            {
                "timestamp": "2026-09-26T08:00:00Z",
                "heartRate": patient.get("heartRate", 0),
                "oxygen": patient.get("oxygen", 0),
                "temperature": patient.get("temperature", 98.6),
                "respiratoryRate": patient.get("respiratoryRate", 0),
            }
        ]

    return {
        "id": patient.get("id"),
        "name": patient.get("name"),
        "age": patient.get("age"),
        "status": patient.get("status"),
        "heartRate": patient.get("heartRate"),
        "oxygen": patient.get("oxygen"),
        "temperature": patient.get("temperature"),
        "respiratoryRate": patient.get("respiratoryRate"),
        "risk": patient.get("risk"),
        "alert": patient.get("alert"),
        "lastUpdated": patient.get("lastUpdated") or "just now",
        "history": history,
    }


@app.get(f"{settings.api_prefix}/alerts", response_model=list[AlertSummary])
def get_alerts() -> List[Dict[str, object]]:
    patients = mysql.fetch_patients() or sample_patients
    return MonitoringService.build_alerts(patients)


@app.get(f"{settings.api_prefix}/sensor/live")
async def get_live_sensor_snapshot() -> Dict[str, Any]:
    if not settings.thingspeak_channel_id or not settings.thingspeak_read_key:
        patient = sample_patients[0]
        return {
            "source": "demo",
            "patient_id": patient.get("id"),
            "heart_rate": patient.get("heartRate"),
            "oxygen_level": patient.get("oxygen"),
            "temperature": patient.get("temperature"),
            "respiratory_rate": patient.get("respiratoryRate"),
            "status": patient.get("status"),
            "risk_score": patient.get("risk"),
        }

    url = (
        f"https://api.thingspeak.com/channels/{settings.thingspeak_channel_id}/feeds.json"
        f"?api_key={settings.thingspeak_read_key}&results=1"
    )

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        payload = response.json()

    feed = (payload.get("feeds") or [{}])[-1]
    patient_id = feed.get("field6") or "P-2048"
    return {
        "source": "thingspeak",
        "patient_id": str(patient_id),
        "heart_rate": int(feed.get("field1") or 0),
        "oxygen_level": int(feed.get("field2") or 0),
        "temperature": float(feed.get("field3") or 98.6),
        "respiratory_rate": int(feed.get("field4") or 0),
        "status": "Stable",
        "risk_score": 0,
    }


@app.post(f"{settings.api_prefix}/sensors/ingest", response_model=VitalEvaluation)
def ingest_sensor(payload: SensorReading) -> Dict[str, object]:
    evaluation = MonitoringService.evaluate_vitals(
        payload.heart_rate,
        payload.oxygen_level,
        payload.temperature,
        payload.respiratory_rate,
    )

    mysql.save_reading(
        {
            "patient_id": payload.patient_id,
            "heart_rate": payload.heart_rate,
            "oxygen_level": payload.oxygen_level,
            "temperature": payload.temperature,
            "respiratory_rate": payload.respiratory_rate,
        }
    )

    return {
        "patient_id": payload.patient_id,
        "status": evaluation["status"],
        "risk_score": evaluation["risk_score"],
        "alert_message": evaluation["alert_message"],
        "heart_rate": payload.heart_rate,
        "oxygen_level": payload.oxygen_level,
        "temperature": payload.temperature,
        "respiratory_rate": payload.respiratory_rate,
        "timestamp": payload.timestamp or "just now",
    }


@app.post(f"{settings.api_prefix}/vitals", response_model=VitalEvaluation)
def ingest_vitals(payload: VitalInput) -> Dict[str, object]:
    evaluation = MonitoringService.evaluate_vitals(
        payload.heart_rate,
        payload.oxygen_level,
        payload.temperature,
        payload.respiratory_rate,
    )

    try:
        mysql.save_reading(
            {
                "patient_id": payload.patient_id,
                "heart_rate": payload.heart_rate,
                "oxygen_level": payload.oxygen_level,
                "temperature": payload.temperature,
                "respiratory_rate": payload.respiratory_rate,
            }
        )
    except Exception as exc:  # pragma: no cover - safety fallback for local demo
        raise HTTPException(status_code=500, detail=f"Failed to save reading: {exc}") from exc

    return {
        "patient_id": payload.patient_id,
        "status": evaluation["status"],
        "risk_score": evaluation["risk_score"],
        "alert_message": evaluation["alert_message"],
        "heart_rate": payload.heart_rate,
        "oxygen_level": payload.oxygen_level,
        "temperature": payload.temperature,
        "respiratory_rate": payload.respiratory_rate,
        "timestamp": "just now",
    }
