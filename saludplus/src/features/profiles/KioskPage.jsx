import { useState } from "react";
import Icon from "../../components/Icon";

function pdfText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function createTicketPdf(ticket, date) {
  const width = 164.4; // 58 mm
  const height = 283.5; // 100 mm
  const lines = [
    "q 0.04 0.43 0.74 rg 24 244 m 40 244 l 42.2 244 44 245.8 44 248 c 44 264 l 44 266.2 42.2 268 40 268 c 24 268 l 21.8 268 20 266.2 20 264 c 20 248 l 20 245.8 21.8 244 24 244 c f Q",
    "q 0.5 0 0 -0.5 20 268 cm 1 1 1 RG 2.5 w 24 36 m 24 36 9 26.5 9 17.5 c 9 9.7 19.6 6.4 24 14.3 c 28.4 6.4 39 9.7 39 17.5 c 39 26.5 24 36 24 36 c S 14.5 21.5 m 19.5 21.5 l 22 17.3 l 25.7 25.3 l 28.2 21.5 l 33.5 21.5 l S Q",
    "BT /F1 15 Tf 0.04 0.19 0.31 rg 49 257 Td (SaludPlus) Tj ET",
    "BT /F1 8 Tf 0.35 0.43 0.51 rg 49 246 Td (Obra Social) Tj ET",
    "BT /F1 9 Tf 0.35 0.43 0.51 rg 20 224 Td (TICKET DE INGRESO) Tj ET",
    "0.85 0.89 0.92 RG 20 213 m 144 213 l S",
    "BT /F1 10 Tf 0.35 0.43 0.51 rg 20 190 Td (TU NUMERO) Tj ET",
    `BT /F1 38 Tf 0.04 0.43 0.74 rg 20 139 Td (${pdfText(ticket.id)}) Tj ET`,
    `BT /F1 10 Tf 0.10 0.20 0.29 rg 20 113 Td (${pdfText(ticket.tipoTurno === "con" ? "Con turno" : "Sin turno")}) Tj ET`,
    `BT /F1 8 Tf 0.35 0.43 0.51 rg 20 96 Td (HORARIO DEL TURNO: ${pdfText(ticket.horaTurno || ticket.hora || "Sin turno")}) Tj ET`,
    `BT /F1 8 Tf 0.35 0.43 0.51 rg 20 82 Td (PRESENTACION: ${pdfText(date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }).toLowerCase())}) Tj ET`,
    `BT /F1 8 Tf 0.35 0.43 0.51 rg 20 68 Td (FECHA: ${pdfText(date.toLocaleDateString("es-AR"))}) Tj ET`,
    "0.85 0.89 0.92 RG 20 56 m 144 56 l S",
    "BT /F1 8 Tf 0.45 0.52 0.58 rg 20 38 Td (Conserva este ticket) Tj 0 -12 Td (y espera tu llamado.) Tj ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${new TextEncoder().encode(lines).length} >>\nstream\n${lines}\nendstream`,
  ];
  let output = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(output).length);
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = new TextEncoder().encode(output).length;
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    output += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([output], { type: "application/pdf" });
}

function downloadTicket(ticket, date) {
  const url = URL.createObjectURL(createTicketPdf(ticket, date));
  const link = document.createElement("a");
  link.href = url;
  link.download = `ticket-${ticket.id}.pdf`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function KioskPage({ onCheckIn, onBack }) {
  const [dni, setDni] = useState("");
  const [tipoTurno, setTipoTurno] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [ticketDate, setTicketDate] = useState(null);
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    const cleanDni = dni.replace(/\D/g, "");
    if (cleanDni.length < 7 || cleanDni.length > 8) {
      setError("Ingresá un DNI válido de 7 u 8 números.");
      return;
    }
    setError("");
    const registeredTicket = onCheckIn(cleanDni, tipoTurno);
    const now = new Date();
    setTicket(registeredTicket);
    setTicketDate(now);
    downloadTicket(registeredTicket, now);
  };
  return (
    <main className="kiosk-screen">
      <button
        className="view-back-button kiosk-view-back"
        type="button"
        onClick={onBack}
        aria-label="Volver atrás"
        title="Volver atrás"
      >
        <Icon name="back" size={19} />
      </button>
      <div className="kiosk-brand">
        <span>
          <Icon name="brand" size={24} />
        </span>
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
              className="kiosk-submit kiosk-download"
              onClick={() => downloadTicket(ticket, ticketDate)}
            >
              Imprimir ticket <span>↓</span>
            </button>
            <button
              className="kiosk-submit"
              onClick={() => {
                setTicket(null);
                setTicketDate(null);
                setDni("");
                setTipoTurno(null);
              }}
            >
              Finalizar
            </button>
          </>
        ) : (
          <>
            <span className="eyebrow">BIENVENIDO/A</span>
            <h1>{tipoTurno ? "Registrá tu llegada" : "¿Tenés turno?"}</h1>
            <p>
              {tipoTurno
                ? "Ingresá tu DNI para confirmar que llegaste al centro médico."
                : "Elegí una opción para comenzar."}
            </p>
            {!tipoTurno ? (
              <div className="kiosk-options">
                <button
                  type="button"
                  className="kiosk-option"
                  onClick={() => setTipoTurno("con")}
                >
                  <strong>Con turno</strong>
                  <span>Tengo una consulta programada</span>
                </button>
                <button
                  type="button"
                  className="kiosk-option"
                  onClick={() => setTipoTurno("sin")}
                >
                  <strong>Sin turno</strong>
                  <span>Necesito atención sin cita previa</span>
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <button
                  type="button"
                  className="kiosk-back"
                  onClick={() => {
                    setTipoTurno(null);
                    setError("");
                  }}
                >
                  ← Cambiar opción
                </button>
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
            )}
          </>
        )}
      </section>
      <p className="kiosk-footnote">
        Centro Capital · Tus datos se utilizan para gestionar tu atención.
      </p>
    </main>
  );
}
