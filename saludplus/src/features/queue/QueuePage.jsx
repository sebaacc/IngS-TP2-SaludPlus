import { ErrorState, LoadingState } from "../../components/AsyncState";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import PrimaryButton from "../../components/PrimaryButton";
import StatCard from "../../components/StatCard";
import DemoControls from "./DemoControls";
import QueueTable from "./QueueTable";
import { formatLocalCallTime, sortEligiblePatients } from "../../utils/queue";

function ClinicContext() {
  return (
    <section className="context-bar" aria-label="Consultorio actual">
      <div className="context-item">
        <span className="context-label">Consultorio</span>
        <strong>3</strong>
      </div>
      <span className="context-divider" />
      <div className="context-item">
        <span className="context-label">Especialidad</span>
        <strong>Cardiología</strong>
      </div>
      <span className="live-indicator">
        <span />
        Demo con datos ficticios
      </span>
    </section>
  );
}

function QueueSummary({ waitingCount }) {
  return (
    <section className="stat-grid" aria-label="Resumen de la cola">
      <StatCard icon="people" value={waitingCount} label="En espera" />
      <StatCard icon="clock" value="12 min" label="Espera promedio" />
      <StatCard
        icon="calendar"
        value="09:00–13:00"
        label="Horario del consultorio"
      />
    </section>
  );
}

function LastCall({ currentCall }) {
  if (!currentCall) return null;
  return (
    <div className="last-call-card" role="status">
      <span className="last-call-icon">
        <Icon name="check" size={20} />
      </span>
      <div>
        <span className="last-call-label">ÚLTIMO TURNO LLAMADO</span>
        <strong>
          {currentCall.id} <small>· Consultorio 3</small>
        </strong>
        <span className="last-call-time">
          Llamado a las {formatLocalCallTime(currentCall.calledAt)}
        </span>
      </div>
    </div>
  );
}

function QueueActions({ waitingCount, onCallNext }) {
  return (
    <div className="call-area">
      <div className="call-note">
        <Icon name="info" size={18} />
        <span>
          Se llama primero a quien tiene prioridad y luego por hora de llegada.
          La cola se guarda en este navegador.
        </span>
      </div>
      <PrimaryButton disabled={!waitingCount} onClick={onCallNext}>
        Llamar al siguiente
      </PrimaryButton>
    </div>
  );
}

export default function QueuePage({
  patients,
  currentCall,
  onCallNext,
  onReset,
  onScenarioChange,
  loading,
  error,
  storageError,
}) {
  const waitingCount = sortEligiblePatients(patients).length;

  return (
    <>
      <PageHeader
        title="Cola de espera"
        description="Seguimiento de pacientes para el consultorio asignado."
      />
      <ClinicContext />
      <QueueSummary waitingCount={waitingCount} />
      <section className="panel queue-panel">
        <div className="panel-heading">
          <div>
            <h2>Pacientes en espera</h2>
            <p>Ordenados por prioridad y hora de llegada</p>
          </div>
          <span className="count-badge">{waitingCount} pacientes</span>
        </div>
        {loading ? (
          <LoadingState label="Cargando la cola…" />
        ) : error ? (
          <ErrorState onRetry={() => onScenarioChange("data")} />
        ) : (
          <QueueTable patients={patients} />
        )}
        {!loading && !error && (
          <QueueActions waitingCount={waitingCount} onCallNext={onCallNext} />
        )}
        {!error && <LastCall currentCall={currentCall} />}
        {storageError && (
          <p className="storage-warning" role="status">
            No se pudo guardar en este navegador. Los cambios se perderán al
            cerrar la página.
          </p>
        )}
      </section>
      <DemoControls onScenarioChange={onScenarioChange} onReset={onReset} />
    </>
  );
}
