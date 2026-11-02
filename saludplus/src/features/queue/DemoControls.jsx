import { useEffect, useRef, useState } from "react";

export default function DemoControls({ onScenarioChange, onReset }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const chooseScenario = (scenario) => {
    onScenarioChange(scenario);
    setOpen(false);
  };

  const reset = () => {
    onReset();
    setOpen(false);
  };

  return (
    <div className="demo-tools" ref={menuRef}>
      {open && (
        <section className="demo-tools-panel" aria-label="Controles de prueba">
          <strong>Controles de prueba</strong>
          <button type="button" onClick={() => chooseScenario("data")}>
            Con datos
          </button>
          <button type="button" onClick={() => chooseScenario("empty")}>
            Cola vacía
          </button>
          <button type="button" onClick={() => chooseScenario("error")}>
            Simular error
          </button>
          <button type="button" className="demo-reset" onClick={reset}>
            Reiniciar demo
          </button>
        </section>
      )}
      <button
        className="demo-tools-trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">⚙</span> Pruebas
      </button>
    </div>
  );
}
