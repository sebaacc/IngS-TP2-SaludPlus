import { useState } from "react";
import Icon from "../../components/Icon";

export default function KioskPage({ onCheckIn }) {
  const [dni, setDni] = useState("");
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    const cleanDni = dni.replace(/\D/g, "");
    if (cleanDni.length < 7 || cleanDni.length > 8) {
      setError("Ingresá un DNI válido de 7 u 8 números.");
      return;
    }
    setError("");
    setTicket(onCheckIn(cleanDni));
  };
  return (
    <main className="kiosk-screen">
      <div className="kiosk-brand">
        <span>+</span>
        <strong>SaludPlus</strong>
      </div>
      <section className="kiosk-card">
        <div className="kiosk-icon">
          <Icon name="people" size={28} />
        </div>
        {ticket ? (
          <>
            <span className="eyebrow">REGISTRO COMPLETADO</span>
            <h1>Ya estás en la lista</h1>
            <p>Guardá tu número y esperá a que aparezca en pantalla.</p>
            <div className="ticket-display">
              <small>TU NÚMERO DE TURNO</small>
              <strong>{ticket.id}</strong>
              <span>Cardiología · Consultorio 3</span>
            </div>
            <button
              className="kiosk-submit"
              onClick={() => {
                setTicket(null);
                setDni("");
              }}
            >
              Finalizar
            </button>
          </>
        ) : (
          <>
            <span className="eyebrow">BIENVENIDO/A</span>
            <h1>Registrá tu llegada</h1>
            <p>Ingresá tu DNI para confirmar que llegaste al centro médico.</p>
            <form onSubmit={submit}>
              <label htmlFor="kiosk-dni">Número de DNI</label>
              <input
                id="kiosk-dni"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Ej. 28456789"
                value={dni}
                onChange={(e) =>
                  setDni(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
              />
              {error && (
                <span className="kiosk-error" role="alert">
                  {error}
                </span>
              )}
              <button className="kiosk-submit" type="submit">
                Confirmar llegada <span>→</span>
              </button>
            </form>
          </>
        )}
      </section>
      <p className="kiosk-footnote">
        Centro Capital · Tus datos se usan solo para esta demostración.
      </p>
    </main>
  );
}
