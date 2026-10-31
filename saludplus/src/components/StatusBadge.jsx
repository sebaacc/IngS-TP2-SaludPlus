export default function StatusBadge({ children, tone = "waiting" }) {
  return (
    <span className={`status status-${tone}`}>
      <span />
      {children}
    </span>
  );
}
