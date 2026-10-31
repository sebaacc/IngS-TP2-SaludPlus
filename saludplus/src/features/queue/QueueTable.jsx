import { EmptyState } from "../../components/AsyncState";
import StatusBadge from "../../components/StatusBadge";
import { sortEligiblePatients } from "../../utils/queue";

export default function QueueTable({ patients }) {
  const waitingPatients = sortEligiblePatients(patients);
  if (!waitingPatients.length)
    return (
      <EmptyState
        title="No hay pacientes en espera"
        description="Cuando se registren nuevas llegadas, aparecerán en esta lista."
      />
    );

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">N.º de turno</th>
            <th scope="col">Hora de llegada</th>
            <th scope="col">Prioridad</th>
            <th scope="col">Estado</th>
          </tr>
        </thead>
        <tbody>
          {waitingPatients.map((patient) => (
            <tr key={patient.id}>
              <td>
                <span className="ticket-number">{patient.id}</span>
              </td>
              <td>{patient.arrived}</td>
              <td>
                <span
                  className={`priority ${patient.priority === "Prioridad" ? "priority-high" : ""}`}
                >
                  {patient.priority === "Prioridad" && (
                    <span className="priority-dot" />
                  )}
                  {patient.priority}
                </span>
              </td>
              <td>
                <StatusBadge>{patient.status}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
