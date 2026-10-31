import { demoPatients } from "../data/demoPatients";

export const demoStorageKey = "saludplus-demo-queue-v1";

function initialDemoState() {
  return { patients: demoPatients, currentCall: null };
}

export function parseDemoState(serializedState) {
  if (!serializedState) return initialDemoState();

  try {
    const parsed = JSON.parse(serializedState);
    if (!Array.isArray(parsed.patients)) return null;

    return {
      patients: parsed.patients,
      currentCall: parsed.currentCall ?? null,
    };
  } catch {
    return null;
  }
}

export function loadDemoState() {
  if (typeof window === "undefined") return initialDemoState();

  try {
    return parseDemoState(window.localStorage.getItem(demoStorageKey)) ?? initialDemoState();
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
