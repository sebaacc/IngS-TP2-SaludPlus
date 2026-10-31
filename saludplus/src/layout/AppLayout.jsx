import Brand from "../components/Brand";
import Icon from "../components/Icon";

const navItems = [
  { id: "queue", label: "Cola de espera", icon: "queue" },
  { id: "waiting-room", label: "Sala de espera", icon: "display" },
];

function Sidebar({ page, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Brand />
      </div>
      <div className="facility">
        <span className="facility-mark">CC</span>
        <span>
          <strong>Centro Capital</strong>
          <small>Centro médico</small>
        </span>
      </div>
      <nav aria-label="Navegación principal">
        <span className="nav-label">MÓDULO</span>
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-link ${page === item.id ? "active" : ""}`}
            aria-current={page === item.id ? "page" : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {page === item.id && <Icon name="chevron" size={17} />}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-avatar" aria-hidden="true">
          MP
        </div>
        <div className="user-details">
          <strong>María P.</strong>
          <span>Profesional · Cardiología</span>
        </div>
        <span className="online-dot" title="Sesión activa" />
      </div>
    </aside>
  );
}

export default function AppLayout({ page, onNavigate, children }) {
  const pageTitle = page === "queue" ? "Cola de espera" : "Sala de espera";

  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={onNavigate} />
      <main className="main-content">
        <div className="topbar">
          <div className="breadcrumb">
            <span>Operación</span>
            <Icon name="chevron" size={15} />
            <strong>{pageTitle}</strong>
          </div>
          <div className="topbar-right">
            <span className="topbar-center">
              <span /> Centro Capital
            </span>
            <span className="avatar-small">MP</span>
          </div>
        </div>
        <div className="content-wrap">{children}</div>
        <footer className="app-footer">
          <Brand />
          <span>Demo académica · Datos ficticios</span>
          <span>SaludPlus · Gestión de sala de espera</span>
        </footer>
      </main>
    </div>
  );
}
