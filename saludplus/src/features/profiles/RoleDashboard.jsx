import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { sortEligiblePatients } from "../../utils/queue";
import ReceptionDashboard from "./ReceptionDashboard";

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
      />
    );
  if (role === "admin")
    return (
      <>
        <PageHeader
          title="Panel de administración"
          description="Resumen de la operación de Centro Capital."
          onBack={onBack}
        />
        <section className="stat-grid">
          <StatCard
            icon="people"
            value={patients.length}
            label="Pacientes registrados"
          />
          <StatCard
            icon="clock"
            value={sortEligiblePatients(patients).length}
            label="En espera"
          />
          <StatCard icon="calendar" value="3" label="Consultorios activos" />
        </section>
        <section className="panel role-panel">
          <h2>Actividad del centro</h2>
          <p>La cola está sincronizada entre los perfiles en este navegador.</p>
          <p>
            Último turno llamado:{" "}
            <strong>{currentCall?.id || "Sin llamados todavía"}</strong>
          </p>
        </section>
      </>
    );
  return null;
}
