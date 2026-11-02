import { useEffect, useRef, useState } from "react";
import { testAccounts } from "../data/testAccounts";

const account = testAccounts[0];
const roleLabels = {
  professional: "Profesional · Cardiología",
  reception: "Recepción · Admisión",
  patients: "Pantalla pública · Sala de espera",
  admin: "Administrador · Centro Capital",
  kiosk: "Tótem de entrada · Autogestión",
};

export default function AccountMenu({ onSignOut, floating = false, role }) {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
        setShowSettings(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setShowSettings(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={menuRef}
      className={`account-menu ${floating ? "account-menu-floating" : ""}`}
    >
      <button
        className="account-trigger"
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          setShowSettings(false);
        }}
      >
        <span className="account-avatar">SP</span>
        <span className="account-name">{account.name}</span>
        <span className="account-caret" aria-hidden="true">
          ⌄
        </span>
      </button>
      {open && (
        <div className="account-dropdown">
          {showSettings ? (
            <section className="account-settings">
              <strong>Configuraciones</strong>
              <span>Cuenta personal</span>
              <small>{account.email}</small>
              <button type="button" onClick={() => setShowSettings(false)}>
                ← Volver
              </button>
            </section>
          ) : (
            <>
              <div className="account-dropdown-heading">
                <strong>{account.email}</strong>
                <small>{roleLabels[role] || "Sesión activa"}</small>
              </div>
              <button type="button" onClick={() => setShowSettings(true)}>
                <span aria-hidden="true">⚙</span> Configuraciones
              </button>
              <button
                type="button"
                className="account-signout"
                onClick={onSignOut}
              >
                <span aria-hidden="true">↪</span> Cerrar sesión
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
