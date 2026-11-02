import {
  demoPatients,
  formatLocalAppointmentTime,
  normalizeAppointmentTime,
} from "../data/demoPatients";

export const demoStorageKey = "saludplus-demo-queue-v3";
const PRESENT_STATUSES = new Set([
  "Recepción",
  "Llamado recepción",
  "Esperando",
  "Llamado",
  "Atendido",
]);

function initialDemoState() {
  return { patients: demoPatients.map(withDemoInsurance), currentCall: null, receptionCall: null };
}

function withDemoInsurance(patient) {
  const isPresent =
    patient.status !== "Ausente" &&
    patient.status !== "Pendiente" &&
    (Boolean(patient.presentedAt) || PRESENT_STATUSES.has(patient.status));
  const presentationTimestamp = Date.parse(patient.presentedAt);
  const fallbackWaitMinutes = 5 + ((Number(String(patient.id).split("-")[1]) || 0) % 10) * 4;
  const presentedAt = Number.isFinite(presentationTimestamp)
    ? patient.presentedAt
    : isPresent
      ? new Date(Date.now() - fallbackWaitMinutes * 60_000).toISOString()
      : null;
  const scheduledTime = normalizeAppointmentTime(patient.horaTurno || patient.hora);
  const presentationTime = presentedAt
    ? formatLocalAppointmentTime(presentedAt)
    : normalizeAppointmentTime(patient.horaPresentacion) || null;
  return {
    ...patient,
    obraSocial: "Salud Plus",
    fecha: new Date().toLocaleDateString("es-AR"),
    hora: scheduledTime,
    horaTurno: scheduledTime,
    arrived: presentationTime,
    horaPresentacion: presentationTime,
    origenIngreso:
      patient.origenIngreso ||
      (patient.ingresoManual ? "Manual" : isPresent ? "Tótem" : "Agenda"),
    presentedAt,
  };
}

export function parseDemoState(serializedState) {
  if (!serializedState) return initialDemoState();

  try {
    const parsed = JSON.parse(serializedState);
    if (!Array.isArray(parsed.patients)) return null;

    const demoById = new Map(demoPatients.map((patient) => [patient.id, patient]));
    const existingPatients = parsed.patients.map((patient) => {
      const normalized = withDemoInsurance(patient);
      const seed = demoById.get(patient.id);
      const hasActivity =
        patient.paidAt ||
        patient.absentAt ||
        patient.calledAt ||
        patient.receptionCalledAt ||
        patient.status === "Ausente" ||
        patient.status === "Atendido";
      if (!seed || hasActivity) return { ...normalized, email: normalized.email || seed?.email };
      return {
        ...normalized,
        email: normalized.email || seed.email,
        especialidad: seed.especialidad,
        medico: seed.medico,
        motivo: seed.motivo,
        hora: seed.horaTurno,
        horaTurno: seed.horaTurno,
        arrived: seed.horaPresentacion,
        horaPresentacion: seed.horaPresentacion,
        status: seed.status,
        origenIngreso: seed.origenIngreso,
        presentedAt: seed.presentedAt,
      };
    });
    const existingIds = new Set(existingPatients.map((patient) => patient.id));
    const addedDemoPatients = demoPatients
      .filter((patient) => !existingIds.has(patient.id))
      .map(withDemoInsurance);

    return {
      patients: [...existingPatients, ...addedDemoPatients],
      currentCall: parsed.currentCall ? withDemoInsurance(parsed.currentCall) : null,
      receptionCall: parsed.receptionCall ? withDemoInsurance(parsed.receptionCall) : null,
    };
  } catch {
    return null;
  }
}

export function loadDemoState() {
  if (typeof window === "undefined") return initialDemoState();

  try {
    return (
      parseDemoState(window.localStorage.getItem(demoStorageKey)) ??
      initialDemoState()
    );
  } catch {
    return initialDemoState();
  }
}

export function saveDemoState(state) {
  try {
    window.localStorage.setItem(demoStorageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
