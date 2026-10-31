import Icon from "./Icon";

export default function PrimaryButton({ children, onClick, disabled = false }) {
  return (
    <button
      className="primary-button"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      <Icon name="bell" />
      {children}
      <Icon name="arrow" size={18} />
    </button>
  );
}
