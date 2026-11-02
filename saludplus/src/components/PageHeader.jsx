import LocalClock from "./LocalClock";
import Icon from "./Icon";

export default function PageHeader({ title, description, onBack }) {
  return (
    <header className="page-heading">
      <div>
        {onBack && (
          <button
            className="view-back-button"
            type="button"
            onClick={onBack}
            aria-label="Volver atrás"
            title="Volver atrás"
          >
            <Icon name="back" size={19} />
          </button>
        )}
        <div className="eyebrow">CENTRO MÉDICO · CENTRO CAPITAL</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <LocalClock />
    </header>
  );
}
