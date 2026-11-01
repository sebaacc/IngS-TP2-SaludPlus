import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import PrimaryButton from "../../components/PrimaryButton";
import { sortReceptionPatients } from "../../utils/queue";

const money = (value) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value || 0);

function Detail({ label, value }) {
  return <div className="reception-detail"><small>{label}</small><strong>{value || "—"}</strong></div>;
}

export default function ReceptionDashboard({ page, patients, receptionCall, onCallNext, onConfirmPayment, onMarkAbsent, onRegisterManual }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [manualDni, setManualDni] = useState("");
  const [manualMessage, setManualMessage] = useState("");
  const waiting = sortReceptionPatients(patients);

  return <>
    <PageHeader title={page === "manual-entry" ? "Ingreso manual" : "Recepción"} description={page === "manual-entry" ? "Registrá a quien no pudo ingresar por el tótem para sumarlo a la cola médica." : "Llamá al paciente, verificá su cobertura y confirmá el pago."} />
    {page === "manual-entry" && <section className="panel manual-entry-panel" id="manual-entry">
      <div><span className="eyebrow">INGRESO EXCEPCIONAL</span><h2>¿El paciente no pasó por el tótem?</h2><p>Buscalo por DNI y agregalo directamente a la cola médica con un nuevo número de turno.</p></div>
      <form onSubmit={(event) => { event.preventDefault(); const cleanDni = manualDni.replace(/\D/g, ""); if (cleanDni.length < 7) { setManualMessage("Ingresá un DNI válido de 7 u 8 números."); return; } const result = onRegisterManual(cleanDni); setManualMessage(result.alreadyRegistered ? `${result.patient.id} ya está registrado con estado “${result.patient.status}”.` : `Paciente agregado a la cola médica con el turno ${result.patient.id}.`); if (!result.alreadyRegistered) setManualDni(""); }}>
        <label htmlFor="manual-patient-dni">DNI del paciente</label><div><input id="manual-patient-dni" inputMode="numeric" autoComplete="off" placeholder="Ej. 28456789" value={manualDni} onChange={(event) => setManualDni(event.target.value.replace(/\D/g, "").slice(0, 8))}/><button className="manual-entry-button" type="submit">Agregar a la cola</button></div>{manualMessage && <p className="manual-entry-message" role="status">{manualMessage}</p>}
      </form>
    </section>}
    {page !== "manual-entry" && <section className="panel reception-workspace" id="reception-queue">
      <div className="reception-queue-head">
        <div><h2>Pacientes por atender en recepción</h2><p>{waiting.length} personas registradas en el tótem</p></div>
        <PrimaryButton disabled={!waiting.length || Boolean(receptionCall)} onClick={onCallNext}>Llamar al siguiente</PrimaryButton>
      </div>
      {receptionCall ? <article className="reception-patient-card">
        <div className="reception-patient-heading"><div><span className="eyebrow">PACIENTE LLAMADO A RECEPCIÓN</span><h2>{receptionCall.id} · {receptionCall.nombre}</h2></div><span className={`insurance-status ${receptionCall.estadoObraSocial === "Activa" ? "is-active" : "is-expired"}`}>Obra social {receptionCall.estadoObraSocial?.toLowerCase()}</span></div>
        <section className="reception-section"><h3>Datos del paciente</h3><div className="reception-details-grid"><Detail label="Nombre completo" value={receptionCall.nombre}/><Detail label="Sexo" value={receptionCall.sexo}/><Detail label="DNI" value={receptionCall.dni}/><Detail label="Teléfono" value={receptionCall.telefono}/></div></section>
        <section className="reception-section"><h3>Cobertura médica</h3><div className="reception-details-grid"><Detail label="Obra social" value="Salud Plus"/><Detail label="N.º de afiliado" value={receptionCall.nroAfiliado}/><Detail label="Estado" value={receptionCall.estadoObraSocial}/></div></section>
        <section className="reception-section"><h3>Datos del turno</h3><div className="reception-details-grid"><Detail label="Motivo de visita" value={receptionCall.motivo}/><Detail label="Médico" value={receptionCall.medico}/><Detail label="Especialidad" value={receptionCall.especialidad}/><Detail label="Fecha y hora" value={`${receptionCall.fecha} · ${receptionCall.hora}`}/></div></section>
        <div className="reception-payment"><div><small>Monto a pagar</small><strong>{money(receptionCall.monto)}</strong></div><div className="reception-actions"><button className="absent-button" onClick={onMarkAbsent}>Marcar ausente y llamar al siguiente</button><button className="payment-button" onClick={() => setConfirmOpen(true)}>Pago recibido</button></div></div>
      </article> : <div className="reception-empty">{waiting.length ? "Llamá al siguiente paciente para consultar sus datos." : "No hay pacientes pendientes. Cuando alguien ingrese su DNI en el tótem, aparecerá aquí."}</div>}
      {waiting.length > 0 && <div className="reception-up-next"><strong>Próximos turnos</strong>{waiting.slice(0, 4).map((patient) => <span key={patient.id}>{patient.id} · {patient.hora}</span>)}</div>}
    </section>}
    {page !== "manual-entry" && confirmOpen && receptionCall && <div className="payment-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmOpen(false); }}><section className="payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title"><div className="payment-check">✓</div><h2 id="payment-title">¿Confirmar el pago?</h2><p>Se registrará el pago de <strong>{money(receptionCall.monto)}</strong> para el turno <strong>{receptionCall.id}</strong>.</p><p>El paciente pasará a la sala de espera con el mismo número para que el médico pueda llamarlo.</p><div className="payment-modal-actions"><button className="payment-cancel" onClick={() => setConfirmOpen(false)}>Volver</button><button className="payment-confirm" onClick={() => { onConfirmPayment(); setConfirmOpen(false); }}>Confirmar pago recibido</button></div></section></div>}
  </>;
}
