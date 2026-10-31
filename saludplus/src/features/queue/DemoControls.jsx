export default function DemoControls({ onScenarioChange, onReset }) {
  return (
    <section className="demo-tools" aria-label="Controles de demostración">
      <span>Estados de demo</span>
      <button type="button" onClick={() => onScenarioChange("data")}>
        Con datos
      </button>
      <button type="button" onClick={() => onScenarioChange("empty")}>
        Cola vacía
      </button>
      <button type="button" onClick={() => onScenarioChange("error")}>
        Simular error
      </button>
      <button type="button" onClick={onReset}>
        Reiniciar demo
      </button>
    </section>
  );
}
