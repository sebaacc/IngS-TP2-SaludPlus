import Brand from "../components/Brand";
import Icon from "../components/Icon";

const roleNames = { professional: "Profesional · Cardiología", reception: "Recepción · Admisión", patients: "Pantalla pública · Sala de espera", admin: "Administrador · Centro Capital" };
const roleUsers = { professional: ["MP", "María P."], reception: ["RC", "Recepción"], patients: ["TV", "Pacientes"], admin: ["AD", "Admin"] };

function Sidebar({ page, onNavigate, role }) {
  const navItems = role === "professional"
    ? [{ id: "queue", label: "Cola de espera", icon: "queue" }, { id: "waiting-room", label: "Sala de espera", icon: "display" }]
    : role === "reception"
      ? [{ id: "overview", label: "Atención en recepción", icon: "people" }, { id: "manual-entry", label: "Ingreso manual", icon: "check" }]
      : role === "admin"
        ? [{ id: "overview", label: "Resumen", icon: "calendar" }, { id: "queue", label: "Cola de espera", icon: "queue" }, { id: "waiting-room", label: "Sala de espera", icon: "display" }]
        : [];
  const [initials, name] = roleUsers[role] || roleUsers.professional;
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
        <span className="nav-label">MÓDULOS</span>
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-link ${page === item.id ? "active" : ""}`}
            aria-current={page === item.id ? "page" : undefined}
            onClick={() => {
              onNavigate(item.id);
              if (role === "reception") {
                window.setTimeout(() => {
                  document.getElementById(item.id === "manual-entry" ? "manual-entry" : "reception-queue")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 0);
              }
            }}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {page === item.id && <Icon name="chevron" size={17} />}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="user-details">
          <strong>{name}</strong>
          <span>{roleNames[role]}</span>
        </div>
        <span className="online-dot" title="Sesión activa" />
      </div>
    </aside>
  );
}

export default function AppLayout({ page, onNavigate, children, role, onSwitchProfile }) {
  const titles = { queue: "Cola de espera", "waiting-room": "Sala de espera", overview: role === "admin" ? "Administración" : "Recepción", "manual-entry": "Ingreso manual" };
  const pageTitle = titles[page] || "SaludPlus";

  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={onNavigate} role={role} />
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
            <span className="avatar-small">{roleUsers[role]?.[0] || "SP"}</span>
            <button type="button" className="switch-profile" onClick={onSwitchProfile}>Cambiar perfil</button>
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
