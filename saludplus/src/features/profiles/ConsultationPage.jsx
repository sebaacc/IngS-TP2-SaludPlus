import { useEffect, useState } from "react";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";

const editableFields = [
  ["nombre", "Nombre y apellido"], ["dni", "DNI"], ["sexo", "Sexo"],
  ["fecha", "Fecha del turno"], ["horaTurno", "Horario del turno"],
  ["horaPresentacion", "Presentación"], ["telefono", "Teléfono"],
  ["email", "Correo electrónico"], ["obraSocial", "Obra social"],
  ["nroAfiliado", "N.º de afiliado"], ["estadoObraSocial", "Estado de cobertura"],
  ["especialidad", "Especialidad"], ["medico", "Profesional"],
  ["motivo", "Motivo de consulta"], ["monto", "Monto de consulta"],
];

export default function ConsultationPage({ patient, onBack, onSave, onFinish, onResume }) {
  const [form, setForm] = useState(() => patient || {});
  const [prescription, setPrescription] = useState({ medication: "", instructions: "", duration: "" });
  const [message, setMessage] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(20);

  useEffect(() => {
    let timer;
    const resetInactivity = () => {
      window.clearTimeout(timer);
      setSecondsLeft(20);
      timer = window.setTimeout(onBack, 20_000);
    };
    const updateCountdown = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    ["click", "keydown", "input", "change"].forEach((event) => window.addEventListener(event, resetInactivity));
    resetInactivity();
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(updateCountdown);
      ["click", "keydown", "input", "change"].forEach((event) => window.removeEventListener(event, resetInactivity));
    };
  }, [onBack]);

  if (!patient) {
    return <section className="panel consultation-empty"><h2>No hay una consulta activa</h2><p>Llamá a un paciente desde la sala de espera para comenzar.</p><button type="button" onClick={onBack}>Volver a pacientes en espera</button></section>;
  }

  const change = (key, value) => setForm((current) => ({ ...current, [key]: key === "monto" ? value : value }));
  const savePatient = () => {
    const normalized = { ...form, monto: Number(form.monto) || 0 };
    onSave(patient.id, normalized);
    setForm(normalized);
    setMessage("Datos del paciente guardados.");
  };
  const addPrescription = () => {
    if (!prescription.medication.trim()) {
      setMessage("Ingresá el medicamento para crear la prescripción.");
      return;
    }
    const item = { ...prescription, createdAt: new Date().toISOString() };
    const prescriptions = [...(patient.prescriptions || []), item];
    onSave(patient.id, { prescriptions });
    setPrescription({ medication: "", instructions: "", duration: "" });
    setMessage("Prescripción guardada.");
  };
  const sendPrescription = (item) => {
    const subject = encodeURIComponent(`Prescripción médica · Turno ${patient.id}`);
    const body = encodeURIComponent(`Paciente: ${patient.nombre}\nMedicamento: ${item.medication}\nIndicaciones: ${item.instructions || "—"}\nDuración: ${item.duration || "—"}`);
    window.open(`mailto:${patient.email || ""}?subject=${subject}&body=${body}`, "_self");
    onSave(patient.id, { prescriptions: (patient.prescriptions || []).map((prescriptionItem) => prescriptionItem === item ? { ...item, sentAt: new Date().toISOString() } : prescriptionItem) });
    setMessage(`Se preparó el correo para ${patient.email || "el paciente"}.`);
  };

  return (
    <>
      <PageHeader title="Consulta médica" description={`Turno ${patient.id} · ${patient.especialidad || ""}`} onBack={onBack} />
      <div className="consultation-session-note"><Icon name="clock" size={18} /><span>La vista vuelve a Pacientes en espera tras <strong>{secondsLeft} s</strong> sin actividad.</span></div>
      <section className="panel consultation-panel">
        <div className="panel-heading"><div><h2>Datos del paciente</h2><p>Podés corregir y guardar la información de la consulta.</p></div><span className="consultation-status">{patient.status === "Atendido" ? "Consulta finalizada" : "Consulta en curso"}</span></div>
        <div className="consultation-fields">
          {editableFields.map(([key, label]) => (
            <label key={key}>{label}<input type={key === "monto" ? "number" : "text"} value={form[key] ?? ""} onChange={(event) => change(key, event.target.value)} /></label>
          ))}
        </div>
        <button className="consultation-secondary-button" type="button" onClick={savePatient}>Guardar datos</button>
      </section>

      <section className="panel consultation-panel prescription-panel">
        <div className="panel-heading"><div><h2>Nueva prescripción médica</h2><p>Completá la receta y guardala en el registro del paciente.</p></div></div>
        <div className="prescription-fields">
          <label>Medicamento<input value={prescription.medication} onChange={(event) => setPrescription({ ...prescription, medication: event.target.value })} placeholder="Nombre y presentación" /></label>
          <label>Indicaciones<textarea value={prescription.instructions} onChange={(event) => setPrescription({ ...prescription, instructions: event.target.value })} placeholder="Dosis y frecuencia" rows={3} /></label>
          <label>Duración<input value={prescription.duration} onChange={(event) => setPrescription({ ...prescription, duration: event.target.value })} placeholder="Ej. 7 días" /></label>
        </div>
        <button className="consultation-primary-button" type="button" onClick={addPrescription}>Guardar prescripción</button>
        {(patient.prescriptions || []).length > 0 && <div className="prescription-list"><h3>Prescripciones</h3>{patient.prescriptions.map((item, index) => <article key={`${item.createdAt}-${index}`}><div><strong>{item.medication}</strong><p>{item.instructions || "Sin indicaciones"} · {item.duration || "Duración no indicada"}</p><small>{item.sentAt ? `Correo preparado · ${patient.email}` : `Destinatario: ${patient.email || "sin correo cargado"}`}</small></div><button type="button" onClick={() => sendPrescription(item)}>Enviar por mail</button></article>)}</div>}
      </section>
      {message && <p className="consultation-message" role="status">{message}</p>}
      <div className="consultation-final-actions">
        {patient.status === "Atendido" ? <button className="consultation-primary-button" type="button" onClick={() => onResume(patient.id)}>Reanudar consulta</button> : <button className="consultation-finish-button" type="button" onClick={() => onFinish(patient.id)}>Finalizar consulta</button>}
      </div>
    </>
  );
}
