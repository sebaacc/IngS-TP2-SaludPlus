import { demoPatients, normalizeAppointmentTime } from "../data/demoPatients";

export const demoStorageKey = "saludplus-demo-queue-v3";

function initialDemoState() {
  return { patients: demoPatients.map(withDemoInsurance), currentCall: null, receptionCall: null };
}

function withDemoInsurance(patient) {
  return {
    ...patient,
    obraSocial: "Salud Plus",
    fecha: new Date().toLocaleDateString("es-AR"),
    hora: normalizeAppointmentTime(patient.hora),
    arrived: normalizeAppointmentTime(patient.arrived || patient.hora),
    origenIngreso:
      patient.origenIngreso || (patient.ingresoManual ? "Manual" : "Tótem"),
    presentedAt:
      patient.presentedAt ||
      (patient.status === "Ausente" ? null : patient.arrived || new Date().toISOString()),
  };
}

export function parseDemoState(serializedState) {
  if (!serializedState) return initialDemoState();

  try {
    const parsed = JSON.parse(serializedState);
    if (!Array.isArray(parsed.patients)) return null;

    const existingPatients = parsed.patients.map(withDemoInsurance);
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
