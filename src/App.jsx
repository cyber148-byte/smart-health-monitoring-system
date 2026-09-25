import { useEffect, useMemo, useState } from "react";

const API_BASE = "/api";

const fallbackPatients = [
  {
    id: "P-1024",
    name: "Ava Thompson",
    age: 29,
    status: "Stable",
    heartRate: 72,
    oxygen: 98,
    temperature: 98.6,
    respiratoryRate: 16,
    risk: 18,
    alert: "Normal readings",
    lastUpdated: "just now",
  },
  {
    id: "P-2048",
    name: "Daniel Brooks",
    age: 47,
    status: "Watch",
    heartRate: 98,
    oxygen: 94,
    temperature: 99.4,
    respiratoryRate: 20,
    risk: 41,
    alert: "Elevated blood pressure",
    lastUpdated: "just now",
  },
  {
    id: "P-3190",
    name: "Maya Patel",
    age: 63,
    status: "Critical",
    heartRate: 118,
    oxygen: 91,
    temperature: 100.8,
    respiratoryRate: 24,
    risk: 83,
    alert: "Immediate attention required",
    lastUpdated: "just now",
  },
  {
    id: "P-4217",
    name: "Noah Kim",
    age: 54,
    status: "Stable",
    heartRate: 69,
    oxygen: 97,
    temperature: 98.3,
    respiratoryRate: 15,
    risk: 22,
    alert: "Recovery improving",
    lastUpdated: "just now",
  },
  {
    id: "P-5162",
    name: "Sofia Martin",
    age: 72,
    status: "Watch",
    heartRate: 101,
    oxygen: 93,
    temperature: 99.7,
    respiratoryRate: 22,
    risk: 58,
    alert: "Oxygen trending lower",
    lastUpdated: "just now",
  },
];

const defaultOverview = {
  total_patients: 5,
  critical_patients: 1,
  watch_patients: 2,
  average_heart_rate: 92,
  average_oxygen: 95,
  active_alerts: 3,
  update_time: "Live",
};

const statuses = {
  Stable: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30",
  Watch: "bg-amber-500/15 text-amber-300 border border-amber-400/30",
  Critical: "bg-red-500/15 text-red-300 border border-red-400/30",
};

function App() {
  const [patients, setPatients] = useState(fallbackPatients);
  const [overview, setOverview] = useState(defaultOverview);
  const [alerts, setAlerts] = useState(
    fallbackPatients.filter((patient) => patient.risk > 35),
  );
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatientDetail = async (patientId) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}`);
      if (!response.ok) {
        throw new Error("Patient detail not found");
      }
      const detail = await response.json();
      setSelectedPatient(detail);
    } catch (detailError) {
      console.error(detailError);
      const patient =
        patients.find((item) => item.id === patientId) || fallbackPatients[0];
      setSelectedPatient({
        ...patient,
        history: [
          {
            timestamp: "just now",
            heartRate: patient.heartRate,
            oxygen: patient.oxygen,
            temperature: patient.temperature,
            respiratoryRate: patient.respiratoryRate,
          },
        ],
      });
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [overviewRes, patientsRes, alertsRes] = await Promise.all([
          fetch(`${API_BASE}/overview`),
          fetch(`${API_BASE}/patients`),
          fetch(`${API_BASE}/alerts`),
        ]);

        if (!overviewRes.ok || !patientsRes.ok || !alertsRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const overviewData = await overviewRes.json();
        const patientsData = await patientsRes.json();
        const alertsData = await alertsRes.json();

        setOverview(overviewData);
        setPatients(
          Array.isArray(patientsData) ? patientsData : fallbackPatients,
        );
        setAlerts(
          Array.isArray(alertsData)
            ? alertsData
            : fallbackPatients.filter((patient) => patient.risk > 35),
        );
        setError("");
      } catch (loadError) {
        console.error(loadError);
        setError("Backend is unavailable. Showing demo data.");
        setPatients(fallbackPatients);
        setOverview(defaultOverview);
        setAlerts(fallbackPatients.filter((patient) => patient.risk > 35));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const metrics = useMemo(
    () => [
      {
        label: "Patients",
        value: String(overview.total_patients ?? patients.length).padStart(
          2,
          "0",
        ),
        accent: "cyan",
      },
      {
        label: "Critical",
        value: String(
          overview.critical_patients ??
            patients.filter((patient) => patient.status === "Critical").length,
        ).padStart(2, "0"),
        accent: "red",
      },
      {
        label: "Watch",
        value: String(
          overview.watch_patients ??
            patients.filter((patient) => patient.status === "Watch").length,
        ).padStart(2, "0"),
        accent: "amber",
      },
      {
        label: "Avg HR",
        value: `${Math.round(
          patients.reduce(
            (sum, patient) => sum + Number(patient.heartRate || 0),
            0,
          ) / Math.max(1, patients.length),
        )} bpm`,
        accent: "violet",
      },
      {
        label: "Avg SpO₂",
        value: `${Math.round(
          patients.reduce(
            (sum, patient) => sum + Number(patient.oxygen || 0),
            0,
          ) / Math.max(1, patients.length),
        )}%`,
        accent: "emerald",
      },
    ],
    [overview, patients],
  );

  const activeAlertCount = overview.active_alerts ?? alerts.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-800 bg-slate-900/80 p-6 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-xl font-bold text-slate-950">
              +
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">
                Clinical Ops
              </p>
              <h1 className="mt-1 text-2xl font-bold">CarePulse</h1>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {["Overview", "Patients", "Alerts", "Reports"].map(
              (item, index) => (
                <button
                  key={item}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    index === 0
                      ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/40"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span>{item}</span>
                  <span className="text-xs text-slate-500">0{index + 1}</span>
                </button>
              ),
            )}
          </nav>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              This shift
            </p>
            <p className="mt-3 text-xl font-semibold text-cyan-300">
              {String(activeAlertCount).padStart(2, "0")} active alerts
            </p>
          </div>
        </aside>

        <main className="flex-1 p-5 md:p-8">
          <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">
                Smart health monitoring system
              </p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                Patient wellness dashboard
              </h2>
            </div>
            <button className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:brightness-110">
              Generate report
            </button>
          </header>

          {error ? (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              {error}
            </div>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/30"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  {item.label}
                </p>
                <div
                  className={`mt-4 text-3xl font-bold ${
                    item.accent === "cyan"
                      ? "text-cyan-300"
                      : item.accent === "red"
                        ? "text-red-300"
                        : item.accent === "amber"
                          ? "text-amber-300"
                          : item.accent === "violet"
                            ? "text-violet-300"
                            : "text-emerald-300"
                  }`}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Patient overview</h3>
                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                  {loading ? "Loading" : "Live"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="pb-3 font-medium">Patient</th>
                      <th className="pb-3 font-medium">Vitals</th>
                      <th className="pb-3 font-medium">Risk</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="cursor-pointer border-t border-slate-800 align-top transition hover:bg-slate-800/50"
                        onClick={() => fetchPatientDetail(patient.id)}
                      >
                        <td className="py-4 pr-4">
                          <div className="font-medium text-slate-100">
                            {patient.name}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            ID {patient.id} • Age {patient.age}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div>HR {patient.heartRate} bpm</div>
                          <div className="mt-1 text-slate-400">
                            SpO₂ {patient.oxygen}%
                          </div>
                          <div className="mt-1 text-slate-400">
                            Temp {patient.temperature}°F
                          </div>
                          <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                              style={{
                                width: `${Math.min(Number(patient.risk || 0), 100)}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="font-semibold text-slate-100">
                            {patient.risk}%
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            RR {patient.respiratoryRate}/min
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statuses[patient.status] || statuses.Stable}`}
                          >
                            {patient.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Priority alerts</h3>
                <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-300">
                  {loading ? "Loading" : "Live"}
                </span>
              </div>

              <div className="space-y-3">
                {alerts.map((alertItem) => (
                  <div
                    key={alertItem.id || alertItem.patient_id || alertItem.name}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-100">
                        {alertItem.name}
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                          alertItem.priority === "High" ||
                          alertItem.status === "Critical"
                            ? "bg-red-500/15 text-red-300"
                            : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {alertItem.priority ||
                          (alertItem.status === "Critical" ? "High" : "Medium")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      {alertItem.message || alertItem.alert}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Risk score: {alertItem.risk || alertItem.score || 0}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      {selectedPatient ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Patient detail
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-100">
                  {selectedPatient.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
              >
                Close
              </button>
            </div>

            {detailLoading ? (
              <div className="text-slate-300">Loading patient details...</div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      ID
                    </p>
                    <p className="mt-2 font-semibold text-slate-100">
                      {selectedPatient.id}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Age
                    </p>
                    <p className="mt-2 font-semibold text-slate-100">
                      {selectedPatient.age}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Risk
                    </p>
                    <p className="mt-2 font-semibold text-slate-100">
                      {selectedPatient.risk}%
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Status
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statuses[selectedPatient.status] || statuses.Stable}`}
                    >
                      {selectedPatient.status}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Heart rate
                    </p>
                    <p className="mt-2 text-xl font-bold text-cyan-300">
                      {selectedPatient.heartRate} bpm
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      SpO₂
                    </p>
                    <p className="mt-2 text-xl font-bold text-emerald-300">
                      {selectedPatient.oxygen}%
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Temperature
                    </p>
                    <p className="mt-2 text-xl font-bold text-violet-300">
                      {selectedPatient.temperature}°F
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Respiratory rate
                    </p>
                    <p className="mt-2 text-xl font-bold text-amber-300">
                      {selectedPatient.respiratoryRate}/min
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Clinical note
                  </p>
                  <p className="mt-2 text-slate-200">{selectedPatient.alert}</p>
                </div>

                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Recent readings
                  </p>
                  <div className="mt-3 space-y-2">
                    {(selectedPatient.history || [])
                      .slice(0, 5)
                      .map((reading, index) => (
                        <div
                          key={`${reading.timestamp || index}`}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-300"
                        >
                          <span>{reading.timestamp || "just now"}</span>
                          <span>
                            HR {reading.heartRate || selectedPatient.heartRate}{" "}
                            • SpO₂ {reading.oxygen || selectedPatient.oxygen} •
                            RR{" "}
                            {reading.respiratoryRate ||
                              selectedPatient.respiratoryRate}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
