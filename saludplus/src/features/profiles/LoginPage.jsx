import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin();
  };

  return (
    <main className="login-screen">
      <div className="profile-brand login-brand">
        <span>+</span>
        <div><strong>SaludPlus</strong><small>Centro Capital</small></div>
      </div>
      <section className="login-card" aria-labelledby="login-title">
        <span className="eyebrow">ACCESO SEGURO</span>
        <h1 id="login-title">Iniciá sesión</h1>
        <p className="login-intro">Ingresá a SaludPlus para elegir tu perfil.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Correo electrónico</label>
          <input id="login-email" type="email" autoComplete="username" placeholder="nombre@ejemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="login-password">Contraseña</label>
          <input id="login-password" type="password" autoComplete="current-password" placeholder="Tu contraseña" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <button className="login-submit" type="submit">Ingresar <span aria-hidden="true">→</span></button>
        </form>
      </section>
    </main>
  );
}
