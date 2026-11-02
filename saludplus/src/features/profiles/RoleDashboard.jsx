import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import ReceptionDashboard from "./ReceptionDashboard";

const PRESENT_STATUSES = new Set([
  "Recepción",
  "Llamado recepción",
  "Esperando",
  "Llamado",
  "Atendido",
]);
const initialDashboardTime = Date.now();

function PieMetric({
  title,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  primaryColor,
  secondaryColor,
}) {
  const total = primaryValue + secondaryValue;
  const primaryPercent = total ? (primaryValue / total) * 100 : 0;
  const background = total
    ? `conic-gradient(${primaryColor} 0 ${primaryPercent}%, ${secondaryColor} ${primaryPercent}% 100%)`
    : "#e8eef3";

  return (
    <section className="admin-metric-card">
      <h2>{title}</h2>
      <div className="admin-pie-layout">
        <div
          className="admin-pie-chart"
          role="img"
          aria-label={`${title}: ${primaryLabel} ${primaryValue}, ${secondaryLabel} ${secondaryValue}`}
          style={{ background }}
        >
        </div>
        <div className="admin-pie-legend">
          <div><i style={{ background: primaryColor }} /><span>{primaryLabel}</span><strong>{primaryValue}</strong></div>
          <div><i style={{ background: secondaryColor }} /><span>{secondaryLabel}</span><strong>{secondaryValue}</strong></div>
          <small>{total} turnos contabilizados</small>
        </div>
      </div>
    </section>
  );
}

function NetworkHealthCard() {
  const [network, setNetwork] = useState({ state: "checking", latency: null });

  useEffect(() => {
    let active = true;
    const setOffline = () => setNetwork({ state: "offline", latency: null });
    const checkNetwork = async () => {
      if (!navigator.onLine) {
        setOffline();
        return;
      }
      const startedAt = performance.now();
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}favicon.svg?health=${Date.now()}`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("No se pudo consultar el sistema");
        const latency = Math.round(performance.now() - startedAt);
        if (!active) return;
        setNetwork({
          state: latency < 350 ? "good" : latency < 900 ? "fair" : "poor",
          latency,
        });
      } catch {
        if (active) setNetwork({ state: "unreachable", latency: null });
      }
    };
    const setOnlineAndCheck = () => checkNetwork();

    checkNetwork();
    const interval = window.setInterval(checkNetwork, 30000);
    window.addEventListener("online", setOnlineAndCheck);
    window.addEventListener("offline", setOffline);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("online", setOnlineAndCheck);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  const labels = {
    checking: ["Consultando", "Midiendo respuesta del sistema…"],
    good: ["Buena", `Sistema responde en ${network.latency} ms`],
    fair: ["Regular", `Sistema responde en ${network.latency} ms`],
    poor: ["Débil", `Respuesta lenta · ${network.latency} ms`],
    offline: ["Sin conexión", "El dispositivo informa que está sin conexión"],
    unreachable: ["Sin respuesta", "No se pudo contactar al sistema"],
  };
  const [quality, description] = labels[network.state];

  return (
    <section className="admin-metric-card network-health-card">
      <h2>Calidad de la red</h2>
      <div className={`network-health-indicator is-${network.state}`}>
        <span className="network-signal" aria-hidden="true"><i /><i /><i /><i /></span>
        <strong>{quality}</strong>
      </div>
      <p>{description}</p>
      <small>Medición desde este dispositivo</small>
    </section>
  );
}

function AdminDashboard({ patients, currentCall, onBack }) {
  const [now, setNow] = useState(initialDashboardTime);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  const waitingPatients = patients.filter((patient) => patient.status === "Esperando");
  const waitDurations = waitingPatients
    .map((patient) => {
      const presentationTime = Date.parse(patient.presentedAt);
      return Number.isFinite(presentationTime)
        ? Math.max(0, (now - presentationTime) / 60_000)
        : null;
    })
    .filter((minutes) => minutes !== null);
  const averageWait = waitDurations.length
    ? Math.round(waitDurations.reduce((sum, minutes) => sum + minutes, 0) / waitDurations.length)
    : null;
  const presentCount = patients.filter(
    (patient) =>
      patient.status !== "Ausente" &&
      (Boolean(patient.presentedAt) || PRESENT_STATUSES.has(patient.status)),
  ).length;
  const absentCount = patients.filter((patient) => patient.status === "Ausente").length;

  return (
    <>
      <PageHeader
        title="Panel de administración"
        description="Resumen de la operación de Centro Capital."
        onBack={onBack}
      />
      <section className="stat-grid">
        <StatCard icon="people" value={patients.length} label="Pacientes registrados" />
        <StatCard icon="clock" value={waitingPatients.length} label="Personas en sala de espera" />
        <StatCard
          icon="clock"
          value={averageWait === null ? "—" : `${averageWait} min`}
          label="Espera promedio por paciente"
        />
      </section>
      <section className="admin-insights-grid" aria-label="Indicadores del centro">
        <PieMetric
          title="Asistencia de hoy"
          primaryLabel="Presentes"
          primaryValue={presentCount}
          secondaryLabel="Ausentes"
          secondaryValue={absentCount}
          primaryColor="#0d9488"
          secondaryColor="#f2c94c"
        />
        <NetworkHealthCard />
      </section>
      <section className="panel role-panel">
        <h2>Actividad del centro</h2>
        <p>La cola está sincronizada entre los perfiles en este navegador.</p>
        <p>
          Último turno llamado: <strong>{currentCall?.id || "Sin llamados todavía"}</strong>
        </p>
      </section>
    </>
  );
}

export default function RoleDashboard({
  role,
  page,
  patients,
  currentCall,
  receptionCall,
  onCallReceptionNext,
  onConfirmReceptionPayment,
  onMarkReceptionAbsent,
  onRegisterManual,
  onBack,
  onMarkPresent,
  onRecall,
}) {
  if (role === "reception")
    return (
      <ReceptionDashboard
        page={page}
        patients={patients}
        receptionCall={receptionCall}
        onCallNext={onCallReceptionNext}
        onConfirmPayment={onConfirmReceptionPayment}
        onMarkAbsent={onMarkReceptionAbsent}
        onRegisterManual={onRegisterManual}
        onBack={onBack}
        onMarkPresent={onMarkPresent}
        onRecall={onRecall}
      />
    );
  if (role === "admin")
    return <AdminDashboard patients={patients} currentCall={currentCall} onBack={onBack} />;
  return null;
}
