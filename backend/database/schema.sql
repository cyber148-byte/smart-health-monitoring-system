CREATE DATABASE IF NOT EXISTS smart_health_db;
USE smart_health_db;

CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Stable',
    heart_rate INT NOT NULL,
    oxygen_level INT NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    respiratory_rate INT NOT NULL,
    risk_score INT NOT NULL,
    alert_message VARCHAR(255) DEFAULT 'Normal readings',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    heart_rate INT NOT NULL,
    oxygen_level INT NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    respiratory_rate INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_patient_id (patient_id),
    INDEX idx_recorded_at (recorded_at)
);

INSERT INTO patients (patient_id, name, age, status, heart_rate, oxygen_level, temperature, respiratory_rate, risk_score, alert_message)
VALUES
    ('P-1024', 'Ava Thompson', 29, 'Stable', 72, 98, 98.60, 16, 18, 'Normal readings'),
    ('P-2048', 'Daniel Brooks', 47, 'Watch', 98, 94, 99.40, 20, 41, 'Elevated blood pressure'),
    ('P-3190', 'Maya Patel', 63, 'Critical', 118, 91, 100.80, 24, 83, 'Immediate attention required'),
    ('P-4217', 'Noah Kim', 54, 'Stable', 69, 97, 98.30, 15, 22, 'Recovery improving'),
    ('P-5162', 'Sofia Martin', 72, 'Watch', 101, 93, 99.70, 22, 58, 'Oxygen trending lower')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    age = VALUES(age),
    status = VALUES(status),
    heart_rate = VALUES(heart_rate),
    oxygen_level = VALUES(oxygen_level),
    temperature = VALUES(temperature),
    respiratory_rate = VALUES(respiratory_rate),
    risk_score = VALUES(risk_score),
    alert_message = VALUES(alert_message);
