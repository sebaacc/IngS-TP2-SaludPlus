import Icon from "../../components/Icon";
import { formatLocalCallTime, sortActiveCalls } from "../../utils/queue";

export default function CalledTurns({ patients, currentCall }) {
  const calledTurns = sortActiveCalls(patients);

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
                <div className="called-turn-identity">
                  <strong>{turn.id}</strong>
                  {turn.nombre && (
                    <span className="called-patient-name">{turn.nombre}</span>
                  )}
                </div>
                <span className="called-room">{turn.destinoLlamado}</span>
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
        <span>Turno actual: {currentCall?.id ?? "ninguno"}.</span>
      </div>
    </aside>
  );
}
