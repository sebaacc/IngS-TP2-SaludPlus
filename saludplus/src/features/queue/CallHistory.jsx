import Icon from "../../components/Icon";
import { formatLocalCallTime } from "../../utils/queue";

export default function CallHistory({ calls, onClose }) {
  return (
    <section className="call-history" aria-labelledby="call-history-title">
      <header className="call-history-header">
        <div>
          <h3 id="call-history-title">Historial de llamados</h3>
          <p>
            {calls.length}{" "}
            {calls.length === 1 ? `turno llamado hoy` : `turnos llamados hoy`}
          </p>
        </div>
        <button
          className="history-close"
          type="button"
          aria-label="Cerrar historial de llamados"
          title="Cerrar historial"
          onClick={onClose}
        >
          <Icon name="close" size={20} />
        </button>
      </header>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Turno</th>
              <th scope="col">Paciente</th>
              <th scope="col">Hora</th>
              <th scope="col">Consultorio</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={`${call.id}-${call.calledAt}`}>
                <td>
                  <span className="ticket-number">{call.id}</span>
                </td>
                <td>{call.nombre || "—"}</td>
                <td>{formatLocalCallTime(call.calledAt)}</td>
                <td>{call.consultorio ?? 3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
