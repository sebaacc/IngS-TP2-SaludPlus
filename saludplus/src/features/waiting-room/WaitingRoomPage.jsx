import { useEffect, useRef, useState } from "react";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import { formatLocalCallTime, sortActiveCalls } from "../../utils/queue";
import CalledTurns from "./CalledTurns";

function playCallTone(audioContext) {
  if (!audioContext || audioContext.state !== "running") return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.4, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.34);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.36);
}

export default function WaitingRoomPage({ patients, onBack }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showScreenControls, setShowScreenControls] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef(null);
  const previousCallRef = useRef(undefined);
  const activeCalls = sortActiveCalls(patients);
  const activeCall = activeCalls[0] || null;
  const activeCallKey = activeCall
    ? `${activeCall.id}-${activeCall.calledAt}`
    : null;

  useEffect(() => {
    if (previousCallRef.current === undefined) {
      previousCallRef.current = activeCallKey;
      return;
    }
    if (
      activeCallKey &&
      activeCallKey !== previousCallRef.current &&
      soundEnabled
    ) {
      const audioContext = audioContextRef.current;
      playCallTone(audioContext);
    }
    previousCallRef.current = activeCallKey;
  }, [activeCallKey, soundEnabled]);

  useEffect(() => () => {
    audioContextRef.current?.close();
  }, []);

  const toggleSound = async () => {
    if (soundEnabled) {
      setSoundEnabled(false);
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = audioContextRef.current || new AudioContextClass();
    audioContextRef.current = audioContext;
    try {
      await audioContext.resume();
    } catch {
      return;
    }
    setSoundEnabled(true);
  };

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
        () => setShowScreenControls(false),
        3000,
      );
      hideCursorTimer = window.setTimeout(() => setShowCursor(false), 4000);
    };
    const handlePointerActivity = () => {
      setShowScreenControls(true);
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
    setShowScreenControls(true);
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
          <p className={`no-call ${activeCall ? "has-call" : ""}`}>
            {activeCall ? activeCall.id : "Aún no hay un turno llamado"}
          </p>
          {activeCall?.nombre && (
            <p className="public-patient-name">{activeCall.nombre}</p>
          )}
          <div className="public-room">
            <Icon name="display" size={24} />
            <span>{activeCall?.destinoLlamado ? `Dirigirse al ${activeCall.destinoLlamado}` : "Esperá a que llamen tu turno"}</span>
          </div>
          <p className="public-caption">
            {activeCall
              ? `Turno llamado a las ${formatLocalCallTime(activeCall.calledAt)}`
              : "Por favor, espere a que su número aparezca en pantalla."}
          </p>
        </div>
        <div className="screen-controls">
          <button
            className={`screen-control fullscreen-toggle${isFullscreen && !showScreenControls ? " is-hidden" : ""}`}
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
          <button
            className={`screen-control sound-toggle-icon${isFullscreen && !showScreenControls ? " is-hidden" : ""}`}
            type="button"
            aria-label={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
            aria-pressed={soundEnabled}
            title={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
            onClick={toggleSound}
          >
            <Icon name={soundEnabled ? "volume" : "volume-off"} size={22} />
          </button>
        </div>
        <CalledTurns patients={patients} currentCall={activeCall} />
      </section>
      <div className="privacy-note">
        <Icon name="check" size={18} />
        <span>
          Se muestran el nombre y el número de turno para identificar el llamado.
          No se publican datos clínicos.
        </span>
      </div>
    </section>
  );
}
