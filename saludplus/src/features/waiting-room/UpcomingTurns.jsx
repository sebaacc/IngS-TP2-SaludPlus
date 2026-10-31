import { sortEligiblePatients } from "../../utils/queue";
import Icon from "../../components/Icon";

export default function UpcomingTurns({ patients, currentCall }) {
  const waitingPatients = sortEligiblePatients(patients);

  return (
    <aside className="upcoming">
      <div className="upcoming-heading">
        <div>
          <span className="eyebrow">CONSULTORIO 3</span>
          <h2>Próximos turnos</h2>
        </div>
        <span className="upcoming-count">{waitingPatients.length}</span>
      </div>
      {waitingPatients.length ? (
        <ol className="upcoming-list">
          {waitingPatients.slice(0, 5).map((patient, index) => (
            <li key={patient.id}>
              <span className="upcoming-position">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong>{patient.id}</strong>
              <span className="upcoming-state">En espera</span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="upcoming-empty">No hay turnos pendientes.</div>
      )}
      <div className="public-message">
        <Icon name="info" size={19} />
        <span>
          Vista de demostración con datos ficticios. Turno actual:{" "}
          {currentCall?.id ?? "ninguno"}.
        </span>
      </div>
    </aside>
  );
}
