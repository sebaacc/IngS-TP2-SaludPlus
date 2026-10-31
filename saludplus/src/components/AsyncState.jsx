import Icon from "./Icon";

export function LoadingState({ label = "Cargando…" }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <span className="state-icon">
        <Icon name="people" size={27} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function ErrorState({ onRetry }) {
  return (
    <div className="empty-state error-state" role="alert">
      <span className="state-icon">
        <Icon name="info" size={27} />
      </span>
      <h3>No pudimos cargar la cola</h3>
      <p>Revisá la conexión e intentá actualizar nuevamente.</p>
      <button className="retry-button" type="button" onClick={onRetry}>
        <Icon name="refresh" size={15} />
        Reintentar
      </button>
    </div>
  );
}
