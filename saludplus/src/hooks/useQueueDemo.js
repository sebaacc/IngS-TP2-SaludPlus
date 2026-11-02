import { useEffect, useRef, useState } from "react";
import {
  demoPatients,
  formatLocalAppointmentTime,
  normalizeAppointmentTime,
  patientFromDni,
} from "../data/demoPatients";
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

  const callNext = (specialty) => {
    if (callLock.current) return;

    const eligiblePatients = specialty
      ? demoState.patients.filter((patient) => patient.especialidad === specialty)
      : demoState.patients;
    const nextPatient = sortEligiblePatients(eligiblePatients)[0];
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
    const receptionCall = { ...nextPatient, calledAt, destinoLlamado: "Box 1" };
    persist({
      ...demoState,
      patients: demoState.patients.map((patient) =>
        patient.id === nextPatient.id
          ? { ...patient, status: "Llamado recepción", receptionCalledAt: calledAt, destinoLlamado: "Box 1" }
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
          return { ...patient, status: "Llamado recepción", receptionCalledAt: calledAt, destinoLlamado: "Box 1" };
        }
        return patient;
      }),
      receptionCall: nextPatient ? { ...nextPatient, calledAt, destinoLlamado: "Box 1" } : null,
    });
  };

  const markPresent = (patientId) => {
    const presentedAt = new Date().toISOString();
    const presentationTime = formatLocalAppointmentTime(presentedAt);
    persist({
      ...demoState,
      patients: demoState.patients.map((patient) =>
        patient.id === patientId
          ? {
              ...patient,
              status: "Esperando",
              presentedAt,
              arrived: presentationTime,
              horaPresentacion: presentationTime,
              origenIngreso: patient.origenIngreso || "Recepción",
            }
          : patient,
      ),
    });
  };

  const recallPatient = (patientId) => {
    const patient = demoState.patients.find((item) => item.id === patientId);
    if (!patient) return null;

    const calledAt = new Date().toISOString();
    const consultorio = patient.consultorio ?? 3;
    const recalledPatient = {
      ...patient,
      status: "Llamado",
      calledAt,
      consultorio,
    };
    persist({
      ...demoState,
      patients: demoState.patients.map((item) =>
        item.id === patientId ? recalledPatient : item,
      ),
      currentCall: recalledPatient,
    });
    return recalledPatient;
  };

  const updatePatient = (patientId, updates) => {
    const updated = demoState.patients.find((patient) => patient.id === patientId);
    if (!updated) return null;
    const patient = { ...updated, ...updates };
    persist({
      ...demoState,
      patients: demoState.patients.map((item) => item.id === patientId ? patient : item),
      currentCall: demoState.currentCall?.id === patientId ? patient : demoState.currentCall,
    });
    return patient;
  };

  const finishConsultation = (patientId, updates = {}) => updatePatient(patientId, {
    ...updates,
    status: "Atendido", attendedAt: new Date().toISOString(),
  });

  const resumeConsultation = (patientId) => updatePatient(patientId, {
    status: "Llamado", attendedAt: null, calledAt: new Date().toISOString(),
  });

  const registerArrival = (dni, tipoTurno = "con") => {
    const nextNumber = demoState.patients.reduce((max, patient) => {
      const match = patient.id.match(/^A-(\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 100) + 1;
    const arrived = normalizeAppointmentTime(
      new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    const registeredPatient = patientFromDni(dni, `A-${nextNumber}`, arrived);
    const patient = {
      ...registeredPatient,
      tipoTurno,
      ...(tipoTurno === "sin"
        ? { hora: "Sin turno", horaTurno: "Sin turno" }
        : {}),
    };
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
    const arrived = normalizeAppointmentTime(
      new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    const patient = {
      ...patientFromDni(dni, `A-${nextNumber}`, arrived),
      status: "Esperando",
      ingresoManual: true,
      origenIngreso: "Manual",
      presentedAt: new Date().toISOString(),
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

  return { demoState, storageError, callNext, callReceptionNext, confirmReceptionPayment, markReceptionAbsent, markPresent, recallPatient, updatePatient, finishConsultation, resumeConsultation, registerArrival, registerManualPatient, isCalling, resetDemo };
}
