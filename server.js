const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const patients = [
  {
    id: "P-1024",
    name: "Ava Thompson",
    age: 29,
    status: "Stable",
    heartRate: 72,
    oxygen: 98,
    systolic: 118,
    diastolic: 78,
    temperature: 98.6,
    steps: 9800,
    risk: 18,
    alert: "No critical issues",
    lastUpdated: "2 mins ago",
  },
  {
    id: "P-2048",
    name: "Daniel Brooks",
    age: 47,
    status: "Watch",
    heartRate: 98,
    oxygen: 94,
    systolic: 135,
    diastolic: 88,
    temperature: 99.4,
    steps: 4200,
    risk: 41,
    alert: "Elevated blood pressure",
    lastUpdated: "5 mins ago",
  },
  {
    id: "P-3190",
    name: "Maya Patel",
    age: 63,
    status: "Critical",
    heartRate: 118,
    oxygen: 91,
    systolic: 152,
    diastolic: 96,
    temperature: 100.8,
    steps: 1600,
    risk: 83,
    alert: "Requires immediate review",
    lastUpdated: "1 min ago",
  },
  {
    id: "P-4217",
    name: "Noah Kim",
    age: 54,
    status: "Stable",
    heartRate: 69,
    oxygen: 97,
    systolic: 120,
    diastolic: 80,
    temperature: 98.3,
    steps: 11250,
    risk: 22,
    alert: "Recovery trend improving",
    lastUpdated: "8 mins ago",
  },
  {
    id: "P-5162",
    name: "Sofia Martin",
    age: 72,
    status: "Watch",
    heartRate: 101,
    oxygen: 93,
    systolic: 142,
    diastolic: 90,
    temperature: 99.7,
    steps: 3400,
    risk: 58,
    alert: "Oxygen trending lower",
    lastUpdated: "3 mins ago",
  },
];

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/overview", (req, res) => {
  const totalPatients = patients.length;
  const criticalPatients = patients.filter(
    (patient) => patient.status === "Critical",
  ).length;
  const watchPatients = patients.filter(
    (patient) => patient.status === "Watch",
  ).length;
  const averageHeartRate = Math.round(
    patients.reduce((sum, patient) => sum + patient.heartRate, 0) /
      totalPatients,
  );
  const averageOxygen = Math.round(
    patients.reduce((sum, patient) => sum + patient.oxygen, 0) / totalPatients,
  );

  res.json({
    totalPatients,
    criticalPatients,
    watchPatients,
    averageHeartRate,
    averageOxygen,
    activeAlerts: criticalPatients + watchPatients,
    updateTime: "Live",
  });
});

app.get("/api/patients", (req, res) => {
  res.json(patients);
});

app.get("/api/alerts", (req, res) => {
  const alerts = patients
    .filter((patient) => patient.risk > 35)
    .map((patient) => ({
      id: patient.id,
      name: patient.name,
      priority: patient.status === "Critical" ? "High" : "Medium",
      risk: patient.risk,
      message: patient.alert,
    }));

  res.json(alerts);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(
    `Smart Health Monitoring System running on http://localhost:${PORT}`,
  );
});
