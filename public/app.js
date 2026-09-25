const statsGrid = document.getElementById("statsGrid");
const patientTableBody = document.getElementById("patientTableBody");
const alertList = document.getElementById("alertList");
const lastUpdated = document.getElementById("lastUpdated");
const shiftSummary = document.getElementById("shiftSummary");

const renderStats = (overview) => {
  const items = [
    { label: "Patients", value: overview.totalPatients },
    { label: "Critical", value: overview.criticalPatients },
    { label: "Watchlist", value: overview.watchPatients },
    { label: "Avg HR", value: `${overview.averageHeartRate} bpm` },
    { label: "Avg O₂", value: `${overview.averageOxygen}%` },
  ];

  statsGrid.innerHTML = items
    .map(
      (item) => `
        <article class="stat-card">
          <div class="label">${item.label}</div>
          <div class="value">${item.value}</div>
        </article>
      `,
    )
    .join("");

  lastUpdated.textContent = overview.updateTime;
  shiftSummary.textContent = `${overview.activeAlerts} active alerts`;
};

const renderPatients = (patients) => {
  patientTableBody.innerHTML = patients
    .map(
      (patient) => `
        <tr>
          <td>
            <div class="name-cell">
              <span class="patient-name">${patient.name}</span>
              <span class="patient-meta">ID ${patient.id} • Age ${patient.age}</span>
            </div>
          </td>
          <td>
            <div>HR ${patient.heartRate} bpm</div>
            <div>O₂ ${patient.oxygen}%</div>
            <div>${patient.systolic}/${patient.diastolic} mmHg</div>
            <div class="progress"><span style="width: ${Math.min(patient.risk, 100)}%"></span></div>
          </td>
          <td>
            <div>${patient.risk}%</div>
            <div class="patient-meta">${patient.lastUpdated}</div>
          </td>
          <td>
            <span class="status-pill ${patient.status.toLowerCase()}">${patient.status}</span>
          </td>
        </tr>
      `,
    )
    .join("");
};

const renderAlerts = (alerts) => {
  if (!alerts.length) {
    alertList.innerHTML =
      '<li class="alert-item"><strong>No priority alerts</strong><span class="alert-meta">All monitored patients are within acceptable ranges.</span></li>';
    return;
  }

  alertList.innerHTML = alerts
    .map(
      (alert) => `
        <li class="alert-item">
          <strong>${alert.name}</strong>
          <div class="alert-meta">${alert.message}</div>
          <div class="alert-meta">Risk score: ${alert.risk}% • ${alert.priority} priority</div>
        </li>
      `,
    )
    .join("");
};

async function fetchDashboardData() {
  const [overviewRes, patientsRes, alertsRes] = await Promise.all([
    fetch("/api/overview"),
    fetch("/api/patients"),
    fetch("/api/alerts"),
  ]);

  const overview = await overviewRes.json();
  const patients = await patientsRes.json();
  const alerts = await alertsRes.json();

  renderStats(overview);
  renderPatients(patients);
  renderAlerts(alerts);
}

fetchDashboardData();
