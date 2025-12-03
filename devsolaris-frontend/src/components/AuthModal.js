import React, { useState, useEffect } from 'react';

export default function AuthModal({ open, onClose, onLogin }) {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); // NUEVO CAMPO PARA REGISTRO

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "https://devsolaris-app-natursur.azurewebsites.net/api/auth";

  // Limpia los campos al abrir el modal
  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setPassword("");
      setPhone(""); // Limpiar teléfono
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" 
        ? `${API_URL}/login`
        : `${API_URL}/register`;

        console.log("Submitting to:", endpoint);

      const body =
        mode === "login"
          ? { email, password }
          : { name, email, password, phone }; // enviar teléfono al registrar

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en autenticación");

      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* TABS */}
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Iniciar sesión
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Registrarse
          </button>
        </div>

        {/* CLOSE BUTTON */}
        <button className="close-btn" onClick={onClose}>✕</button>

        <form onSubmit={handleSubmit} className="auth-body">

          {error && <p className="auth-error">{error}</p>}

          {mode === "register" && (
            <>
              <label>
                Nombre
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label>
                Teléfono
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </label>
            </>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button className="auth-submit" disabled={loading} type="submit">
            {loading
              ? "Procesando..."
              : mode === "login"
              ? "Entrar"
              : "Registrarse"}
          </button>
        </form>
      </div>
    </div>
  );
}
