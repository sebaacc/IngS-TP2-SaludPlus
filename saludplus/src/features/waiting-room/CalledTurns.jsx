import Icon from "../../components/Icon";
import { formatLocalCallTime, sortCallHistory } from "../../utils/queue";

export default function CalledTurns({ patients, currentCall }) {
  const calledTurns = sortCallHistory(patients);

  return (
    <aside className="upcoming called-turns" aria-label="Turnos llamados hoy">
      <div className="upcoming-heading">
        <h2>Llamados</h2>
        <span className="upcoming-count">{calledTurns.length}</span>
      </div>
      {calledTurns.length ? (
        <ol className="called-turn-list">
          {calledTurns.map((turn, index) => (
            <li className="called-turn" key={`${turn.id}-${turn.calledAt}`}>
              <span className="upcoming-position">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="called-turn-details">
                <strong>{turn.id}</strong>
                <span className="called-room">
                  Consultorio {turn.consultorio ?? 3}
                </span>
              </div>
              <time dateTime={turn.calledAt}>
                {formatLocalCallTime(turn.calledAt)}
              </time>
            </li>
          ))}
        </ol>
      ) : (
        <div className="upcoming-empty">Todavía no hay turnos llamados.</div>
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
