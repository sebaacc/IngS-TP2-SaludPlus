import { useEffect, useState } from "react";
import AppLayout from "./layout/AppLayout";
import ProfilePicker from "./features/profiles/ProfilePicker";
import LoginPage from "./features/profiles/LoginPage";
import KioskPage from "./features/profiles/KioskPage";
import RoleDashboard from "./features/profiles/RoleDashboard";
import WaitingRoomPage from "./features/waiting-room/WaitingRoomPage";
import QueuePage from "./features/queue/QueuePage";
import ConsultationPage from "./features/profiles/ConsultationPage";
import FinishedAbsentPage from "./features/profiles/FinishedAbsentPage";
import { useQueueDemo } from "./hooks/useQueueDemo";
import { sortEligiblePatients } from "./utils/queue";
import "./App.css";

const PROFESSIONAL_SPECIALTY = "Cardiología";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("queue");
  const [scenario, setScenario] = useState("data");
  const [loadVersion, setLoadVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [consultationPatientId, setConsultationPatientId] = useState(null);
  const {
    demoState,
    storageError,
    callNext,
    callReceptionNext,
    confirmReceptionPayment,
    markReceptionAbsent,
    markPresent,
    recallPatient,
    updatePatient,
    finishConsultation,
    resumeConsultation,
    registerArrival,
    registerManualPatient,
    isCalling,
    resetDemo,
  } = useQueueDemo();

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, [scenario, loadVersion]);

  useEffect(() => {
    if (!notification) return undefined;
    const timer = window.setTimeout(() => setNotification(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const selectScenario = (nextScenario) => {
    if (nextScenario === "data") resetDemo();
    setScenario(nextScenario);
    setLoading(true);
    setLoadVersion((version) => version + 1);
  };

  const resetDemoScenario = () => {
    selectScenario("data");
  };

  const handleConfirmReceptionPayment = () => {
    const paidPatient = demoState.receptionCall;
    confirmReceptionPayment();
    setNotification({
      id: Date.now(),
      title: "Pago recibido",
      message: `Se registró el pago del turno ${paidPatient?.id ?? ""}.`,
    });
  };

  const handleMarkPresent = (patient) => {
    markPresent(patient.id);
    setNotification({
      id: Date.now(),
      title: "Paciente presente",
      message: `El turno ${patient.id} volvió a la sala de espera.`,
    });
  };

  const handleRecallPatient = (patient) => {
    const recalled = recallPatient(patient.id);
    if (!recalled) return;
    setNotification({
      id: Date.now(),
      title: "Turno llamado nuevamente",
      message: `Se volvió a llamar al turno ${patient.id}.`,
    });
  };

  const handleCallNext = (specialty) => {
    if (isCalling) return;
    const eligiblePatients = specialty
      ? demoState.patients.filter((patient) => patient.especialidad === specialty)
      : demoState.patients;
    const nextPatient = sortEligiblePatients(eligiblePatients)[0];
    if (!nextPatient) return;

    callNext(specialty);
    if (role === "professional") {
      setConsultationPatientId(nextPatient.id);
      setPage("consultation");
    }
    setNotification({
      id: Date.now(),
      title: "Turno llamado",
      message: `Se llamó al turno ${nextPatient.id}.`,
    });
  };

  const signOut = () => {
    setRole(null);
    setAuthenticated(false);
  };

  const goBack = () => {
    if (role === "reception" && ["manual-entry", "appointments"].includes(page)) {
      setPage("overview");
      return;
    }
    if (role === "admin" && page === "waiting-room") {
      setPage("queue");
      return;
    }
    if (role === "admin" && page === "queue") {
      setPage("overview");
      return;
    }
    setRole(null);
  };

  const previewPatients =
    scenario === "empty" || scenario === "error" ? [] : demoState.patients;
  const queuePatients =
    role === "professional"
      ? previewPatients.filter(
          (patient) => patient.especialidad === PROFESSIONAL_SPECIALTY,
        )
      : previewPatients;
  const queueAllPatients =
    role === "professional"
      ? demoState.patients.filter(
          (patient) => patient.especialidad === PROFESSIONAL_SPECIALTY,
        )
      : demoState.patients;
  const queueCurrentCall =
    role === "professional" &&
    demoState.currentCall?.especialidad !== PROFESSIONAL_SPECIALTY
      ? null
      : demoState.currentCall;
  const consultationPatient = demoState.patients.find(
    (patient) => patient.id === consultationPatientId,
  ) || (role === "professional" ? queueCurrentCall : null);

  if (!authenticated)
    return <LoginPage onLogin={() => setAuthenticated(true)} />;

  if (!role)
    return (
      <ProfilePicker
        onSignOut={signOut}
        onBack={signOut}
        onSelect={(selected) => {
          setRole(selected);
          setPage(
            selected === "kiosk"
              ? "kiosk"
              : selected === "patients"
                ? "waiting-room"
                : selected === "admin"
                  ? "overview"
                  : selected === "reception"
                    ? "overview"
                    : "queue",
          );
        }}
      />
    );

  if (role === "kiosk")
    return (
      <>
        <button className="kiosk-switch" onClick={() => setRole(null)}>
          Cambiar perfil
        </button>
        <KioskPage onCheckIn={registerArrival} onBack={goBack} />
      </>
    );
  if (role === "patients")
    return (
      <main className="public-demo-page">
        <div className="public-demo-toolbar">
          <button className="switch-profile" onClick={() => setRole(null)}>
            Cambiar perfil
          </button>
        </div>
        <WaitingRoomPage
          patients={demoState.patients}
          currentCall={demoState.receptionCall || demoState.currentCall}
          onBack={goBack}
        />
      </main>
    );

  return (
    <AppLayout
      page={page}
      onNavigate={setPage}
      role={role}
      onSwitchProfile={() => setRole(null)}
      onSignOut={signOut}
      notification={notification}
    >
      {role === "reception" || (role === "admin" && page === "overview") ? (
        <RoleDashboard
          role={role}
          page={page}
          onBack={goBack}
          patients={demoState.patients}
          currentCall={demoState.currentCall}
          receptionCall={demoState.receptionCall}
          onCallReceptionNext={callReceptionNext}
          onConfirmReceptionPayment={handleConfirmReceptionPayment}
          onMarkReceptionAbsent={markReceptionAbsent}
          onRegisterManual={registerManualPatient}
          onMarkPresent={handleMarkPresent}
          onRecall={handleRecallPatient}
        />
      ) : page === "queue" ? (
        <QueuePage
          onBack={goBack}
          patients={queuePatients}
          allPatients={queueAllPatients}
          currentCall={queueCurrentCall}
          onCallNext={() =>
            handleCallNext(
              role === "professional" ? PROFESSIONAL_SPECIALTY : undefined,
            )
          }
          isCalling={isCalling}
          onScenarioChange={selectScenario}
          onReset={resetDemoScenario}
          loading={loading}
          error={scenario === "error" && !loading}
          storageError={storageError}
        />
      ) : page === "consultation" && role === "professional" ? (
        <ConsultationPage
          key={consultationPatient?.id || "no-active-consultation"}
          patient={consultationPatient}
          onBack={() => setPage("queue")}
          onSave={updatePatient}
          onFinish={(patientId, updates) => {
            finishConsultation(patientId, updates);
            setNotification({ id: Date.now(), title: "Consulta finalizada", message: `Se registró la atención del turno ${patientId}.` });
          }}
          onResume={(patientId) => {
            resumeConsultation(patientId);
            setNotification({ id: Date.now(), title: "Consulta reanudada", message: `Se reanudó la consulta del turno ${patientId}.` });
          }}
        />
      ) : page === "finished-absent" && role === "professional" ? (
        <FinishedAbsentPage
          patients={queueAllPatients}
          onBack={() => setPage("queue")}
        />
      ) : (
        <WaitingRoomPage
          patients={demoState.patients}
          currentCall={demoState.receptionCall || demoState.currentCall}
          onBack={goBack}
        />
      )}
    </AppLayout>
  );
}

export default App;
