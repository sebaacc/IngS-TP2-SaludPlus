import { useEffect, useRef, useState } from "react";
import { demoPatients } from "../data/demoPatients";
import { loadDemoState, saveDemoState } from "../services/demoStorage";
import { sortEligiblePatients } from "../utils/queue";

export function useQueueDemo() {
  const [demoState, setDemoState] = useState(loadDemoState);
  const [storageError, setStorageError] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const callLock = useRef(false);
  const callingTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(callingTimer.current), []);

  const persist = (nextState) => {
    setDemoState(nextState);
    setStorageError(!saveDemoState(nextState));
  };

  const callNext = () => {
    if (callLock.current) return;

    const nextPatient = sortEligiblePatients(demoState.patients)[0];
    if (!nextPatient) return;

    callLock.current = true;
    setIsCalling(true);
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

    callingTimer.current = window.setTimeout(() => {
      callLock.current = false;
      setIsCalling(false);
      callingTimer.current = null;
    }, 3500);
  };

  const resetDemo = () => {
    window.clearTimeout(callingTimer.current);
    callingTimer.current = null;
    callLock.current = false;
    setIsCalling(false);
    persist({
      patients: demoPatients.map((patient) => ({ ...patient })),
      currentCall: null,
    });
  };

  return { demoState, storageError, callNext, isCalling, resetDemo };
}
