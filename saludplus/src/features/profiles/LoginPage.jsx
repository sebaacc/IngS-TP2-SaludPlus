import { useState } from "react";
import { testAccounts } from "../../data/testAccounts";
import Icon from "../../components/Icon";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = (event) => {
    event.preventDefault();
    const account = testAccounts.find(
      (item) =>
        item.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        item.password === password,
    );
    if (!account) {
      setError("El correo o la contraseña no son correctos.");
      return;
    }
    setError("");
    onLogin();
  };

  return (
    <main className="login-screen">
      <div className="profile-brand login-brand">
        <span>
          <Icon name="brand" size={24} />
        </span>
        <div>
          <strong>SaludPlus</strong>
          <small>Centro Capital</small>
        </div>
      </div>
      <section className="login-card" aria-labelledby="login-title">
        <span className="eyebrow">ACCESO SEGURO</span>
        <h1 id="login-title">Iniciá sesión</h1>
        <p className="login-intro">
          Ingresá a SaludPlus para elegir tu perfil.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            placeholder="nombre@ejemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <button className="login-submit" type="submit">
            Ingresar <span aria-hidden="true">→</span>
          </button>
        </form>
      </section>
    </main>
  );
}
