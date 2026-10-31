import Icon from "./Icon";

export default function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Icon name="brand" size={24} />
      </span>
      <span>
        <strong>SaludPlus</strong>
        <small>Obra Social</small>
      </span>
    </div>
  );
}
