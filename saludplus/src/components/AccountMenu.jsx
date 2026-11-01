import { useState } from "react";

export default function AccountMenu({ onSignOut, floating = false }) {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  return (
    <div className={`account-menu ${floating ? "account-menu-floating" : ""}`}>
      <button className="account-trigger" type="button" aria-expanded={open} onClick={() => { setOpen((value) => !value); setShowSettings(false); }}>
        <span className="account-avatar">SP</span>
        <span className="account-name">María Pérez</span>
        <span className="account-caret" aria-hidden="true">⌄</span>
      </button>
      {open && <div className="account-dropdown">
        {showSettings ? <section className="account-settings">
          <strong>Configuraciones</strong>
          <span>Cuenta personal</span>
          <small>maria.perez@saludplus.com</small>
          <button type="button" onClick={() => setShowSettings(false)}>← Volver</button>
        </section> : <>
          <div className="account-dropdown-heading"><strong>SaludPlus</strong><small>Sesión activa</small></div>
          <button type="button" onClick={() => setShowSettings(true)}><span aria-hidden="true">⚙</span> Configuraciones</button>
          <button type="button" className="account-signout" onClick={onSignOut}><span aria-hidden="true">↪</span> Cerrar sesión</button>
        </>}
      </div>}
    </div>
  );
}
