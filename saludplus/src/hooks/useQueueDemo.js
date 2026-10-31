import { useState } from "react";
import { demoPatients } from "../data/demoPatients";
import { loadDemoState, saveDemoState } from "../services/demoStorage";
import { sortEligiblePatients } from "../utils/queue";

export function useQueueDemo() {
  const [demoState, setDemoState] = useState(loadDemoState);
  const [storageError, setStorageError] = useState(false);

  const persist = (nextState) => {
    setDemoState(nextState);
    setStorageError(!saveDemoState(nextState));
  };

  const callNext = () => {
    const nextPatient = sortEligiblePatients(demoState.patients)[0];
    if (!nextPatient) return;

    const calledAt = new Date().toISOString();
    persist({
      ...demoState,
      patients: demoState.patients.map((patient) =>
        patient.id === nextPatient.id
          ? { ...patient, status: "Llamado", calledAt }
          : patient,
      ),
      currentCall: { ...nextPatient, status: "Llamado", calledAt },
    });
  };

  const resetDemo = () => {
    persist({
      patients: demoPatients.map((patient) => ({ ...patient })),
      currentCall: null,
    });
  };

  return { demoState, storageError, callNext, resetDemo };
}
