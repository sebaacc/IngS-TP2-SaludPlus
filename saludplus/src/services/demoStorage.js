import { demoPatients } from "../data/demoPatients";

const storageKey = "saludplus-demo-queue-v1";

function initialDemoState() {
  return { patients: demoPatients, currentCall: null };
}

export function loadDemoState() {
  if (typeof window === "undefined") return initialDemoState();

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return initialDemoState();

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.patients)) return initialDemoState();

    return {
      patients: parsed.patients,
      currentCall: parsed.currentCall ?? null,
    };
  } catch {
    return initialDemoState();
  }
}

export function saveDemoState(state) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
