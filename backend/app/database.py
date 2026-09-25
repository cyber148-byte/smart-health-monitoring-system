from __future__ import annotations

from typing import Any, Dict, List

import pymysql

from app.config import get_settings


class MySQLClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    def get_connection(self):
        return pymysql.connect(
            host=self.settings.mysql_host,
            port=self.settings.mysql_port,
            user=self.settings.mysql_user,
            password=self.settings.mysql_password,
            database=self.settings.mysql_database,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True,
        )

    def fetch_patients(self) -> List[Dict[str, Any]]:
        try:
            with self.get_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT patient_id AS id, name, age, status, heart_rate AS heartRate,
                               oxygen_level AS oxygen, temperature, respiratory_rate AS respiratoryRate,
                               risk_score AS risk, alert_message AS alert, last_updated AS lastUpdated
                        FROM patients
                        ORDER BY last_updated DESC
                        """
                    )
                    return cursor.fetchall() or []
        except Exception:
            return []

    def fetch_patient_by_id(self, patient_id: str) -> Dict[str, Any] | None:
        try:
            with self.get_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT patient_id AS id, name, age, status, heart_rate AS heartRate,
                               oxygen_level AS oxygen, temperature, respiratory_rate AS respiratoryRate,
                               risk_score AS risk, alert_message AS alert, last_updated AS lastUpdated
                        FROM patients
                        WHERE patient_id = %s
                        LIMIT 1
                        """,
                        (patient_id,),
                    )
                    return cursor.fetchone()
        except Exception:
            return None

    def fetch_patient_history(self, patient_id: str) -> List[Dict[str, Any]]:
        try:
            with self.get_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT patient_id AS patientId, heart_rate AS heartRate,
                               oxygen_level AS oxygen, temperature, respiratory_rate AS respiratoryRate,
                               recorded_at AS timestamp
                        FROM patient_readings
                        WHERE patient_id = %s
                        ORDER BY recorded_at DESC
                        LIMIT 8
                        """,
                        (patient_id,),
                    )
                    return cursor.fetchall() or []
        except Exception:
            return []

    def save_reading(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        try:
            with self.get_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        INSERT INTO patient_readings (patient_id, heart_rate, oxygen_level, temperature, respiratory_rate, recorded_at)
                        VALUES (%s, %s, %s, %s, %s, NOW())
                        """,
                        (
                            payload["patient_id"],
                            payload["heart_rate"],
                            payload["oxygen_level"],
                            payload["temperature"],
                            payload["respiratory_rate"],
                        ),
                    )
            return {"status": "saved", "stored": True}
        except Exception:
            return {"status": "saved", "stored": False, "fallback": "local"}
