import { useEffect, useState } from "react";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import { formatLocalCallTime } from "../../utils/queue";
import CalledTurns from "./CalledTurns";

export default function WaitingRoomPage({ patients, currentCall, onBack }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showFullscreenControl, setShowFullscreenControl] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen && !isClosing) {
        setIsFullscreen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        isFullscreen &&
        !document.fullscreenElement
      ) {
        setIsClosing(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isClosing, isFullscreen]);

  useEffect(() => {
    if (!isFullscreen || isClosing) return undefined;

    let hideControlTimer;
    let hideCursorTimer;
    const hideAfterInactivity = () => {
      window.clearTimeout(hideControlTimer);
      window.clearTimeout(hideCursorTimer);
      hideControlTimer = window.setTimeout(
        () => setShowFullscreenControl(false),
        3000,
      );
      hideCursorTimer = window.setTimeout(() => setShowCursor(false), 4000);
    };
    const handlePointerActivity = () => {
      setShowFullscreenControl(true);
      setShowCursor(true);
      hideAfterInactivity();
    };

    hideAfterInactivity();
    window.addEventListener("pointermove", handlePointerActivity);
    window.addEventListener("pointerdown", handlePointerActivity);
    return () => {
      window.clearTimeout(hideControlTimer);
      window.clearTimeout(hideCursorTimer);
      window.removeEventListener("pointermove", handlePointerActivity);
      window.removeEventListener("pointerdown", handlePointerActivity);
    };
  }, [isClosing, isFullscreen]);

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        setIsClosing(true);
      }
      return;
    }

    setIsFullscreen(true);
    setIsClosing(false);
    setShowFullscreenControl(true);
    setShowCursor(true);
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Keep the in-app fullscreen view if browser fullscreen is unavailable.
      }
    }
  };

  const finishClosing = (event) => {
    if (event.target !== event.currentTarget || !isClosing) return;
    setIsFullscreen(false);
    setIsClosing(false);
  };

  return (
    <section
      className={`waiting-room-page${isFullscreen ? " is-fullscreen" : ""}${isClosing ? " is-closing" : ""}${isFullscreen && !showCursor ? " is-cursor-hidden" : ""}`}
      onAnimationEnd={finishClosing}
    >
      <PageHeader
        title="Sala de espera"
        description="Información clara para orientar a las personas que esperan."
        onBack={onBack}
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
            <span>Diríjase al consultorio {currentCall?.consultorio ?? 3}</span>
          </div>
          <p className="public-caption">
            {currentCall
              ? `Turno llamado a las ${formatLocalCallTime(currentCall.calledAt)}`
              : "Por favor, espere a que su número aparezca en pantalla."}
          </p>
        </div>
        <button
          className={`fullscreen-toggle${isFullscreen && !showFullscreenControl ? " is-hidden" : ""}`}
          type="button"
          aria-label={
            isFullscreen
              ? "Salir de pantalla completa"
              : "Ver sala en pantalla completa"
          }
          aria-pressed={isFullscreen}
          title={
            isFullscreen
              ? "Salir de pantalla completa"
              : "Ver sala en pantalla completa"
          }
          onClick={toggleFullscreen}
        >
          <Icon name={isFullscreen ? "compress" : "expand"} size={22} />
        </button>
        <CalledTurns patients={patients} currentCall={currentCall} />
      </section>
      <div className="privacy-note">
        <Icon name="check" size={18} />
        <span>
          Solo se muestran números de turno; no se publican nombres ni datos
          clínicos.
        </span>
      </div>
    </section>
  );
}
