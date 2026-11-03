import { useEffect, useState } from "react";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";

const editableFields = [
  ["nombre", "Nombre y apellido"], ["dni", "DNI"], ["sexo", "Sexo"],
  ["fecha", "Fecha del turno"], ["horaTurno", "Horario del turno"],
  ["horaPresentacion", "Presentación"], ["telefono", "Teléfono"],
  ["email", "Correo electrónico"], ["obraSocial", "Obra social"],
  ["nroAfiliado", "N.º de afiliado"],
];
const turnFields = [["especialidad", "Especialidad"], ["medico", "Profesional"], ["motivo", "Motivo de consulta"]];

function dateInputValue(value) {
  const match = String(value || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? value : "";
}

function timeInputValue(value) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})(?:\s*([ap])\.?\s*m\.?)?$/i);
  if (!match) return "";
  let hour = Number(match[1]);
  if (match[3]) {
    const isPm = match[3].toLowerCase() === "p";
    hour = (hour % 12) + (isPm ? 12 : 0);
  }
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
}

function displayDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${Number(match[3])}/${Number(match[2])}/${match[1]}` : value;
}

function displayTime(value) {
  const match = String(value || "").match(/^(\d{2}):(\d{2})$/);
  if (!match) return value;
  const hour24 = Number(match[1]);
  return `${String(hour24 % 12 || 12).padStart(2, "0")}:${match[2]} ${hour24 >= 12 ? "pm" : "am"}`;
}

function escapeHtml(value) {
  return String(value || "—").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

export default function ConsultationPage({ patient, onBack, onSave, onFinish, onResume }) {
  const [form, setForm] = useState(() => patient || {});
  const emptyPrescription = () => ({ medication: "", instructions: "", duration: "" });
  const [prescription, setPrescription] = useState(emptyPrescription);
  const [draftPrescriptions, setDraftPrescriptions] = useState([]);
  const [dataMessage, setDataMessage] = useState("");
  const [prescriptionMessage, setPrescriptionMessage] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (patient?.status !== "Atendido") return undefined;
    let timer;
    const resetInactivity = () => {
      window.clearTimeout(timer);
      setSecondsLeft(60);
      timer = window.setTimeout(onBack, 60_000);
    };
    const updateCountdown = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    ["click", "keydown", "input", "change"].forEach((event) => window.addEventListener(event, resetInactivity));
    resetInactivity();
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(updateCountdown);
      ["click", "keydown", "input", "change"].forEach((event) => window.removeEventListener(event, resetInactivity));
    };
  }, [onBack, patient?.status]);

  if (!patient) {
    return <section className="panel consultation-empty"><h2>No hay una consulta activa</h2><p>Llamá a un paciente desde la sala de espera para comenzar.</p><button type="button" onClick={onBack}>Volver a pacientes en espera</button></section>;
  }

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const patientUpdates = () => ({
      ...form,
      fecha: displayDate(form.fecha),
      horaTurno: displayTime(form.horaTurno),
      hora: displayTime(form.horaTurno),
      horaPresentacion: displayTime(form.horaPresentacion),
      arrived: displayTime(form.horaPresentacion),
    });
  const updateFormDisplayValues = (normalized) => setForm({
    ...normalized,
    fecha: dateInputValue(normalized.fecha),
    horaTurno: timeInputValue(normalized.horaTurno),
    horaPresentacion: timeInputValue(normalized.horaPresentacion),
  });
  const savePatient = () => {
    const normalized = patientUpdates();
    onSave(patient.id, normalized);
    updateFormDisplayValues(normalized);
    setDataMessage("Datos del paciente guardados.");
  };
  const finishConsultation = () => {
    const normalized = patientUpdates();
    onFinish(patient.id, normalized);
    updateFormDisplayValues(normalized);
    setDataMessage("Datos guardados al finalizar la consulta.");
  };
  const addPrescriptionMedicine = () => {
    if (!prescription.medication.trim()) {
      setPrescriptionMessage("Ingresá el medicamento para crear la prescripción.");
      return;
    }
    setDraftPrescriptions((items) => [...items, { ...prescription, id: `${Date.now()}-${items.length}` }]);
    setPrescription(emptyPrescription());
    setPrescriptionMessage("");
  };
  const savePrescription = () => {
    if (!draftPrescriptions.length) {
      setPrescriptionMessage("Agregá al menos un medicamento a la prescripción.");
      return;
    }
    const createdAt = new Date().toISOString();
    const items = draftPrescriptions.map(({ id, ...item }) => ({ ...item, createdAt }));
    onSave(patient.id, { prescriptions: [...(patient.prescriptions || []), ...items] });
    setDraftPrescriptions([]);
    setPrescriptionMessage("Prescripción guardada.");
  };
  const sendPrescription = (item) => {
    const subject = encodeURIComponent(`Prescripción médica · Turno ${patient.id}`);
    const body = encodeURIComponent(`Paciente: ${patient.nombre}\nMedicamento: ${item.medication}\nIndicaciones: ${item.instructions || "—"}\nDuración: ${item.duration || "—"}`);
    window.open(`mailto:${patient.email || ""}?subject=${subject}&body=${body}`, "_self");
    onSave(patient.id, { prescriptions: (patient.prescriptions || []).map((prescriptionItem) => prescriptionItem === item ? { ...item, sentAt: new Date().toISOString() } : prescriptionItem) });
    setPrescriptionMessage(`Se preparó el correo para ${patient.email || "el paciente"}.`);
  };
  const printPrescription = (item) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setPrescriptionMessage("Permití las ventanas emergentes para imprimir o guardar la receta en PDF.");
      return;
    }
    printWindow.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Prescripción médica · ${escapeHtml(patient.nombre)}</title><style>body{font:16px Arial,sans-serif;color:#173650;margin:48px;line-height:1.5}h1{font-size:24px;margin-bottom:8px}.muted{color:#667f94}.card{border:1px solid #dbe6ee;border-radius:10px;padding:20px;margin-top:24px}h2{font-size:18px;margin:0 0 14px}p{margin:8px 0}.signature{margin-top:70px;border-top:1px solid #9aabb9;width:280px;padding-top:8px;color:#667f94}@media print{body{margin:18mm}}</style></head><body><h1>Prescripción médica</h1><p class="muted">SaludPlus · Centro Capital</p><p><strong>Paciente:</strong> ${escapeHtml(patient.nombre)}<br><strong>DNI:</strong> ${escapeHtml(patient.dni)}<br><strong>Obra social:</strong> ${escapeHtml(patient.obraSocial)}</p><div class="card"><h2>${escapeHtml(item.medication)}</h2><p><strong>Indicaciones:</strong> ${escapeHtml(item.instructions || "Sin indicaciones")}</p><p><strong>Duración:</strong> ${escapeHtml(item.duration || "No indicada")}</p></div><p><strong>Profesional:</strong> ${escapeHtml(patient.medico)}</p><div class="signature">Firma y sello profesional</div><script>window.onload=()=>window.print();</script></body></html>`);
    printWindow.document.close();
  };

  return (
    <>
      <PageHeader title="Consulta médica" description={`Turno ${patient.id} · ${patient.especialidad || ""}`} onBack={onBack} />
      {patient.status === "Atendido" && <div className="consultation-session-note"><Icon name="clock" size={18} /><span>La vista vuelve a Pacientes en espera tras <strong>{secondsLeft} s</strong> sin actividad.</span></div>}
      <section className="panel consultation-panel">
        <div className="panel-heading"><div><h2>Datos del paciente</h2><p>Podés corregir y guardar la información de la consulta.</p></div><span className="consultation-status">{patient.status === "Atendido" ? "Consulta finalizada" : "Consulta en curso"}</span></div>
        <div className="consultation-fields">
          {editableFields.map(([key, label]) => (
            <label key={key}>{label}{key === "sexo" ? <select value={form[key] === "Masculino" || form[key] === "Femenino" ? form[key] : "Otro"} onChange={(event) => change(key, event.target.value)}><option>Masculino</option><option>Femenino</option><option>Otro</option></select> : <input type={key === "fecha" ? "date" : key === "horaTurno" || key === "horaPresentacion" ? "time" : "text"} value={key === "fecha" ? dateInputValue(form[key]) : key === "horaTurno" || key === "horaPresentacion" ? timeInputValue(form[key]) : form[key] ?? ""} onChange={(event) => change(key, event.target.value)} />}</label>
          ))}
          <label>Estado de cobertura<input value={patient.estadoObraSocial || "—"} readOnly /></label>
        </div>
        <button className="consultation-secondary-button" type="button" onClick={savePatient}>Guardar datos</button>
        {dataMessage && <p className="consultation-message" role="status">{dataMessage}</p>}
      </section>

      <section className="panel consultation-panel">
        <div className="panel-heading"><div><h2>Datos del turno</h2><p>Información asignada al turno, solo lectura.</p></div></div>
        <div className="consultation-fields">
          {turnFields.map(([key, label]) => <label key={key}>{label}<input value={patient[key] || "—"} readOnly /></label>)}
        </div>
      </section>

      <section className="panel consultation-panel consultation-history-panel">
        <div className="panel-heading"><div><h2>Historial de turnos anteriores</h2><p>Consultas previas registradas para este paciente.</p></div></div>
        {(patient.historialTurnos || []).length > 0 ? <div className="table-wrap"><table className="consultation-history-table"><thead><tr><th>Fecha</th><th>Motivo</th></tr></thead><tbody>{patient.historialTurnos.map((turn, index) => <tr key={`${turn.fecha}-${index}`}><td>{turn.fecha}</td><td>{turn.motivo}</td></tr>)}</tbody></table></div> : <p className="consultation-history-empty">No hay turnos anteriores registrados.</p>}
      </section>

      <section className="panel consultation-panel prescription-panel">
        <div className="panel-heading"><div><h2>Nueva prescripción médica</h2><p>Completá la receta y guardala en el registro del paciente.</p></div></div>
        <div className="prescription-fields">
          <label>Medicamento<input value={prescription.medication} onChange={(event) => setPrescription({ ...prescription, medication: event.target.value })} placeholder="Nombre y presentación" /></label>
          <label>Indicaciones<textarea value={prescription.instructions} onChange={(event) => setPrescription({ ...prescription, instructions: event.target.value })} placeholder="Dosis y frecuencia" rows={3} /></label>
          <label>Duración<input value={prescription.duration} onChange={(event) => setPrescription({ ...prescription, duration: event.target.value })} placeholder="Ej. 7 días" /></label>
        </div>
        <button className="consultation-secondary-button prescription-add-button" type="button" onClick={addPrescriptionMedicine}>Agregar medicamento</button>
        {draftPrescriptions.length > 0 && <div className="prescription-draft-list" aria-label="Medicamentos de la prescripción">{draftPrescriptions.map((item, index) => <article key={item.id}><div><strong>{item.medication}</strong><p>{item.instructions || "Sin indicaciones"} · {item.duration || "Duración no indicada"}</p></div><button className="prescription-remove-button" type="button" aria-label={`Quitar ${item.medication}`} title="Quitar medicamento" onClick={() => setDraftPrescriptions((items) => items.filter((draft) => draft.id !== item.id))}>×</button></article>)}</div>}
        <button className="consultation-primary-button prescription-save-button" type="button" onClick={savePrescription}>Guardar prescripción</button>
        {(patient.prescriptions || []).length > 0 && <div className="prescription-list"><h3>Prescripciones</h3>{patient.prescriptions.map((item, index) => <article key={`${item.createdAt}-${index}`}><div><strong>{item.medication}</strong><p>{item.instructions || "Sin indicaciones"} · {item.duration || "Duración no indicada"}</p><small>{item.sentAt ? `Correo preparado · ${patient.email}` : `Destinatario: ${patient.email || "sin correo cargado"}`}</small></div><div className="prescription-actions"><button type="button" onClick={() => printPrescription(item)}>Imprimir / PDF</button><button type="button" onClick={() => sendPrescription(item)}>Enviar por mail</button></div></article>)}</div>}
        {prescriptionMessage && <p className="consultation-message" role="status">{prescriptionMessage}</p>}
      </section>
      <div className="consultation-final-actions">
        {patient.status === "Atendido" ? <button className="consultation-primary-button" type="button" onClick={() => onResume(patient.id)}>Reanudar consulta</button> : <button className="consultation-finish-button" type="button" onClick={finishConsultation}>Finalizar consulta</button>}
      </div>
    </>
  );
}
