import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import { formatLocalCallTime } from "../../utils/queue";
import UpcomingTurns from "./UpcomingTurns";

export default function WaitingRoomPage({ patients, currentCall }) {
  return (
    <>
      <PageHeader
        title="Sala de espera"
        description="Información clara para orientar a las personas que esperan."
      />
      <section
        className="public-screen"
        aria-label="Pantalla pública de turnos"
      >
        <div className="public-call">
          <div className="public-kicker">
            <span className="public-pulse" />
            LLAMADO ACTUAL
          </div>
          <p className={`no-call ${currentCall ? "has-call" : ""}`}>
            {currentCall ? currentCall.id : "Aún no hay un turno llamado"}
          </p>
          <div className="public-room">
            <Icon name="display" size={24} />
            <span>Diríjase al consultorio 3</span>
          </div>
          <p className="public-caption">
            {currentCall
              ? `Turno llamado a las ${formatLocalCallTime(currentCall.calledAt)}`
              : "Por favor, espere a que su número aparezca en pantalla."}
          </p>
        </div>
        <UpcomingTurns patients={patients} currentCall={currentCall} />
      </section>
      <div className="privacy-note">
        <Icon name="check" size={18} />
        <span>
          Solo se muestran números de turno; no se publican nombres ni datos
          clínicos.
        </span>
      </div>
    </>
  );
}
