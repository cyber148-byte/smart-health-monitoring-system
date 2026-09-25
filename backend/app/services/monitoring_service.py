from __future__ import annotations

from datetime import datetime
from typing import Dict, List


class MonitoringService:
    """Business rules for health alerting and state evaluation."""

    @staticmethod
    def evaluate_vitals(heart_rate: int, oxygen_level: int, temperature: float, respiratory_rate: int) -> Dict[str, object]:
        risk_score = 0
        alert_message = "Normal readings"
        status = "Stable"

        if heart_rate < 60 or heart_rate > 100:
            risk_score += 20
        if oxygen_level < 94:
            risk_score += 25
        if temperature > 99.5:
            risk_score += 15
        if respiratory_rate < 12 or respiratory_rate > 22:
            risk_score += 20

        if heart_rate > 110 or oxygen_level < 90 or temperature > 101 or respiratory_rate > 28:
            status = "Critical"
            alert_message = "Immediate attention required"
            risk_score += 30
        elif risk_score >= 35:
            status = "Watch"
            alert_message = "Requires monitoring"
        else:
            status = "Stable"
            alert_message = "Normal readings"

        risk_score = min(risk_score, 100)

        return {
            "status": status,
            "risk_score": risk_score,
            "alert_message": alert_message,
        }

    @staticmethod
    def build_overview(patients: List[Dict[str, object]]) -> Dict[str, object]:
        total = len(patients)
        critical = sum(1 for patient in patients if patient.get("status") == "Critical")
        watch = sum(1 for patient in patients if patient.get("status") == "Watch")

        avg_heart = round(sum(int(patient.get("heartRate", 0)) for patient in patients) / total) if total else 0
        avg_oxygen = round(sum(int(patient.get("oxygen", 0)) for patient in patients) / total) if total else 0

        return {
            "totalPatients": total,
            "criticalPatients": critical,
            "watchPatients": watch,
            "averageHeartRate": avg_heart,
            "averageOxygen": avg_oxygen,
            "activeAlerts": critical + watch,
            "updateTime": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        }

    @staticmethod
    def build_alerts(patients: List[Dict[str, object]]) -> List[Dict[str, object]]:
        alerts = []
        for patient in patients:
            risk = int(patient.get("risk", 0))
            if risk > 35:
                alerts.append(
                    {
                        "id": patient.get("id"),
                        "name": patient.get("name"),
                        "priority": "High" if patient.get("status") == "Critical" else "Medium",
                        "risk": risk,
                        "message": patient.get("alert", "Requires monitoring"),
                    }
                )
        return alerts
