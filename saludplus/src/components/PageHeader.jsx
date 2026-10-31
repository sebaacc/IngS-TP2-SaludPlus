import LocalClock from "./LocalClock";

export default function PageHeader({ title, description }) {
  return (
    <header className="page-heading">
      <div>
        <div className="eyebrow">CENTRO MÉDICO · CENTRO CAPITAL</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <LocalClock />
    </header>
  );
}
