import AccountMenu from "../../components/AccountMenu";

const profiles = [
  ["professional", "Profesional", "Gestiona la cola y llama al siguiente paciente.", "MP", "Cardiología · Consultorio 3"],
  ["reception", "Recepción", "Registra llegadas y consulta quién está esperando.", "RC", "Admisión · Centro Capital"],
  ["patients", "Pacientes", "Pantalla pública con llamados y sala de espera.", "TV", "Pantalla de turnos · Centro Capital"],
  ["admin", "Administrador", "Revisa la actividad general del centro médico.", "AD", "Administración · Centro Capital"],
  ["kiosk", "Tótem de entrada", "Ingresa tu DNI para registrarte al llegar.", "DNI", "Autogestión · Hall de entrada"],
];

export default function ProfilePicker({ onSelect, onSignOut }) {
  return <main className="profile-screen">
    <AccountMenu onSignOut={onSignOut} />
    <div className="profile-brand"><span>+</span><div><strong>SaludPlus</strong><small>Centro Capital</small></div></div>
    <header className="profile-heading"><span className="eyebrow">ACCESO AL SISTEMA</span><h1>¿Qué perfil querés explorar?</h1><p>Elegí un perfil para continuar.</p></header>
    <section className="profile-grid" aria-label="Perfiles disponibles">
      {profiles.map(([id, title, description, initials, detail]) => <button className="profile-card" key={id} onClick={() => onSelect(id)}>
        <span className="profile-avatar">{initials}</span><span className="profile-card-copy"><strong>{title}</strong><small>{description}</small><em>{detail}</em></span><span className="profile-arrow">→</span>
      </button>)}
    </section>
    <p className="profile-disclaimer">Seleccioná un perfil para continuar</p>
  </main>;
}

