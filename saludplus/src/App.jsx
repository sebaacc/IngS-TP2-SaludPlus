import { useEffect, useState } from "react";
import AppLayout from "./layout/AppLayout";
import QueuePage from "./features/queue/QueuePage";
import WaitingRoomPage from "./features/waiting-room/WaitingRoomPage";
import { useQueueDemo } from "./hooks/useQueueDemo";
import "./App.css";

function App() {
  const [page, setPage] = useState("queue");
  const [scenario, setScenario] = useState("data");
  const [loadVersion, setLoadVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const { demoState, storageError, callNext, isCalling, resetDemo } =
    useQueueDemo();

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

  return (
    <AppLayout page={page} onNavigate={setPage}>
      {page === "queue" ? (
        <QueuePage
          patients={previewPatients}
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
