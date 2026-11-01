import { useEffect, useRef, useState } from "react";
import { demoPatients, patientFromDni } from "../data/demoPatients";
import {
  demoStorageKey,
  loadDemoState,
  parseDemoState,
  saveDemoState,
} from "../services/demoStorage";
import { sortEligiblePatients, sortReceptionPatients } from "../utils/queue";

export function useQueueDemo() {
  const [demoState, setDemoState] = useState(loadDemoState);
  const [storageError, setStorageError] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const callLock = useRef(false);
  const callingTimer = useRef(null);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== demoStorageKey && event.key !== null) return;

      const updatedState = parseDemoState(event.newValue);
      if (!updatedState) return;

      setDemoState(updatedState);
      setStorageError(false);
    };

    // The storage event is delivered to other tabs sharing this origin.
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.clearTimeout(callingTimer.current);
    };
  }, []);

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
    const consultorio = nextPatient.consultorio ?? 3;
    persist({
      ...demoState,
      patients: demoState.patients.map((patient) =>
        patient.id === nextPatient.id
          ? { ...patient, status: "Llamado", calledAt, consultorio }
          : patient,
      ),
      currentCall: { ...nextPatient, status: "Llamado", calledAt, consultorio },
    });

    callingTimer.current = window.setTimeout(() => {
      callLock.current = false;
      setIsCalling(false);
      callingTimer.current = null;
    }, 3500);
  };

  const callReceptionNext = () => {
    const nextPatient = sortReceptionPatients(demoState.patients)[0];
    if (!nextPatient) return null;
    const calledAt = new Date().toISOString();
    const receptionCall = { ...nextPatient, calledAt };
    persist({
      ...demoState,
      patients: demoState.patients.map((patient) =>
        patient.id === nextPatient.id
          ? { ...patient, status: "Llamado recepción", receptionCalledAt: calledAt }
          : patient,
      ),
      receptionCall,
    });
    return receptionCall;
  };

  const confirmReceptionPayment = () => {
    const patient = demoState.receptionCall;
    if (!patient) return;
    persist({
      ...demoState,
      patients: demoState.patients.map((item) =>
        item.id === patient.id
          ? { ...item, status: "Esperando", paidAt: new Date().toISOString() }
          : item,
      ),
      receptionCall: null,
    });
  };

  const markReceptionAbsent = () => {
    const calledPatient = demoState.receptionCall;
    if (!calledPatient) return;
    const nextPatient = sortReceptionPatients(demoState.patients).find(
      (patient) => patient.id !== calledPatient.id,
    );
    const calledAt = nextPatient ? new Date().toISOString() : null;
    persist({
      ...demoState,
      patients: demoState.patients.map((patient) => {
        if (patient.id === calledPatient.id) {
          return { ...patient, status: "Ausente", absentAt: new Date().toISOString() };
        }
        if (nextPatient && patient.id === nextPatient.id) {
          return { ...patient, status: "Llamado recepción", receptionCalledAt: calledAt };
        }
        return patient;
      }),
      receptionCall: nextPatient ? { ...nextPatient, calledAt } : null,
    });
  };

  const registerArrival = (dni) => {
    const nextNumber = demoState.patients.reduce((max, patient) => {
      const match = patient.id.match(/^A-(\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 100) + 1;
    const arrived = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    const patient = patientFromDni(dni, `A-${nextNumber}`, arrived);
    persist({ ...demoState, patients: [...demoState.patients, patient] });
    return patient;
  };

  const registerManualPatient = (dni) => {
    const existing = demoState.patients.find(
      (patient) => patient.dni === dni && patient.status !== "Ausente",
    );
    if (existing) return { patient: existing, alreadyRegistered: true };
    const nextNumber = demoState.patients.reduce((max, patient) => {
      const match = patient.id.match(/^A-(\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 100) + 1;
    const arrived = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    const patient = {
      ...patientFromDni(dni, `A-${nextNumber}`, arrived),
      status: "Esperando",
      ingresoManual: true,
    };
    persist({ ...demoState, patients: [...demoState.patients, patient] });
    return { patient, alreadyRegistered: false };
  };

  const resetDemo = () => {
    window.clearTimeout(callingTimer.current);
    callingTimer.current = null;
    callLock.current = false;
    setIsCalling(false);
    persist({
      patients: demoPatients.map((patient) => ({ ...patient })),
      currentCall: null,
      receptionCall: null,
    });
  };

  return { demoState, storageError, callNext, callReceptionNext, confirmReceptionPayment, markReceptionAbsent, registerArrival, registerManualPatient, isCalling, resetDemo };
}
