import PageHeader from "../../components/PageHeader";

function formatClock(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function FinishedAbsentPage({ patients, onBack }) {
  const closedPatients = patients
    .filter((patient) => patient.status === "Atendido" || patient.status === "Ausente")
    .sort((a, b) => String(b.attendedAt || b.absentAt || "").localeCompare(String(a.attendedAt || a.absentAt || "")));

  return (
    <>
      <PageHeader title="Finalizados/Ausentes" description="Pacientes atendidos o ausentes de tu especialidad." onBack={onBack} />
      <section className="panel finished-patients-panel">
        <div className="panel-heading">
          <div><h2>Pacientes finalizados o ausentes</h2><p>{closedPatients.length} pacientes</p></div>
        </div>
        <div className="table-wrap">
          <table className="finished-patients-table">
            <thead><tr><th>Turno</th><th>Paciente</th><th>Especialidad</th><th>Fecha</th><th>Hora programada</th><th>Motivo</th><th>Estado</th><th>Hora de finalización</th></tr></thead>
            <tbody>
              {closedPatients.map((patient) => <tr key={patient.id}>
                <td><strong>{patient.id}</strong></td>
                <td>{patient.nombre}</td>
                <td>{patient.especialidad}</td>
                <td>{patient.fecha || "—"}</td>
                <td>{patient.horaTurno || patient.hora || "—"}</td>
                <td>{patient.motivo || "—"}</td>
                <td><span className={`finished-patient-status ${patient.status === "Ausente" ? "is-absent" : "is-finished"}`}>{patient.status}</span></td>
                <td>{formatClock(patient.attendedAt || patient.absentAt)}</td>
              </tr>)}
              {closedPatients.length === 0 && <tr><td colSpan="8" className="finished-patients-empty">Todavía no hay consultas finalizadas ni pacientes ausentes.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
