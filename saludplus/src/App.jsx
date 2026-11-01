import { useEffect, useState } from "react";
import AppLayout from "./layout/AppLayout";
import ProfilePicker from "./features/profiles/ProfilePicker";
import KioskPage from "./features/profiles/KioskPage";
import RoleDashboard from "./features/profiles/RoleDashboard";
import WaitingRoomPage from "./features/waiting-room/WaitingRoomPage";
import QueuePage from "./features/queue/QueuePage";
import { useQueueDemo } from "./hooks/useQueueDemo";
import "./App.css";

function App() {
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("queue");
  const [scenario, setScenario] = useState("data");
  const [loadVersion, setLoadVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const {
    demoState,
    storageError,
    callNext,
    callReceptionNext,
    confirmReceptionPayment,
    markReceptionAbsent,
    registerArrival,
    registerManualPatient,
    isCalling,
    resetDemo,
  } = useQueueDemo();

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, [scenario, loadVersion]);

  const selectScenario = (nextScenario) => {
    setScenario(nextScenario);
    setLoading(true);
    setLoadVersion((version) => version + 1);
  };

  const restartDemo = () => {
    resetDemo();
    selectScenario("data");
  };

  const previewPatients =
    scenario === "empty" || scenario === "error" ? [] : demoState.patients;

  if (!role)
    return (
      <ProfilePicker
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
        <KioskPage onCheckIn={registerArrival} />
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
          currentCall={demoState.currentCall}
        />
      </main>
    );

  return (
    <AppLayout
      page={page}
      onNavigate={setPage}
      role={role}
      onSwitchProfile={() => setRole(null)}
    >
      {role === "reception" || (role === "admin" && page === "overview") ? (
        <RoleDashboard
          role={role}
          page={page}
          patients={demoState.patients}
          currentCall={demoState.currentCall}
          receptionCall={demoState.receptionCall}
          onCallReceptionNext={callReceptionNext}
          onConfirmReceptionPayment={confirmReceptionPayment}
          onMarkReceptionAbsent={markReceptionAbsent}
          onRegisterManual={registerManualPatient}
        />
      ) : page === "queue" ? (
        <QueuePage
          patients={previewPatients}
          allPatients={demoState.patients}
          currentCall={demoState.currentCall}
          onCallNext={callNext}
          isCalling={isCalling}
          onReset={restartDemo}
          onScenarioChange={selectScenario}
          loading={loading}
          error={scenario === "error" && !loading}
          storageError={storageError}
        />
      ) : (
        <WaitingRoomPage
          patients={demoState.patients}
          currentCall={demoState.currentCall}
        />
      )}
    </AppLayout>
  );
}

export default App;
