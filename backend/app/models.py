from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class PatientRecord:
    patient_id: str
    name: str
    age: int
    status: str
    heart_rate: int
    oxygen_level: int
    temperature: float
    respiratory_rate: int
    risk_score: int
    alert_message: str
    last_updated: Optional[str] = None

    @classmethod
    def from_dict(cls, payload: dict) -> "PatientRecord":
        return cls(
            patient_id=payload.get("id", "P-0000"),
            name=payload.get("name", "Unknown"),
            age=int(payload.get("age", 0)),
            status=payload.get("status", "Stable"),
            heart_rate=int(payload.get("heartRate", 0)),
            oxygen_level=int(payload.get("oxygen", 0)),
            temperature=float(payload.get("temperature", 98.6)),
            respiratory_rate=int(payload.get("respiratoryRate", 0)),
            risk_score=int(payload.get("risk", 0)),
            alert_message=payload.get("alert", "No alerts"),
            last_updated=payload.get("lastUpdated") or datetime.utcnow().isoformat(timespec="seconds"),
        )


@dataclass
class VitalReading:
    patient_id: str
    heart_rate: int
    oxygen_level: int
    temperature: float
    respiratory_rate: int
    timestamp: Optional[str] = None
