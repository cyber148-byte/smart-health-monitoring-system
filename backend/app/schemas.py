from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class VitalInput(BaseModel):
    patient_id: str = Field(..., example="P-1024")
    heart_rate: int = Field(..., ge=0, le=220, example=78)
    oxygen_level: int = Field(..., ge=0, le=100, example=96)
    temperature: float = Field(..., ge=90.0, le=110.0, example=98.7)
    respiratory_rate: int = Field(..., ge=0, le=80, example=18)


class AlertSummary(BaseModel):
    id: str
    name: str
    priority: Literal["High", "Medium", "Low"]
    risk: int
    message: str


class HealthOverview(BaseModel):
    total_patients: int
    critical_patients: int
    watch_patients: int
    average_heart_rate: int
    average_oxygen: int
    active_alerts: int
    update_time: str


class PatientResponse(BaseModel):
    id: str
    name: str
    age: int
    status: str
    heartRate: int
    oxygen: int
    temperature: float
    respiratoryRate: int
    risk: int
    alert: str
    lastUpdated: str


class SensorReading(BaseModel):
    patient_id: str = Field(..., example="P-2048")
    heart_rate: int = Field(..., ge=0, le=220, example=98)
    oxygen_level: int = Field(..., ge=0, le=100, example=94)
    temperature: float = Field(..., ge=90.0, le=110.0, example=99.4)
    respiratory_rate: int = Field(..., ge=0, le=80, example=20)
    source: Optional[str] = Field(default="sensor")
    timestamp: Optional[str] = None


class PatientDetailResponse(PatientResponse):
    history: List[dict] = Field(default_factory=list)


class VitalEvaluation(BaseModel):
    patient_id: str
    status: str
    risk_score: int
    alert_message: str
    heart_rate: int
    oxygen_level: int
    temperature: float
    respiratory_rate: int
    timestamp: str


class PatientListResponse(BaseModel):
    patients: List[PatientResponse]
