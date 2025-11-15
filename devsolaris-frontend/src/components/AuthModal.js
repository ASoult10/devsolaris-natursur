import React, { useState } from 'react';

export default function AuthModal({ open, onClose, onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!open) return null;

  function handleLogin(e) {
    e.preventDefault();
    // Simple fake auth
    const user = { name: name || email.split('@')[0], email };
    onLogin(user);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal-header">
          <h4>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h4>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </header>

        <form className="modal-body" onSubmit={handleLogin}>
          {mode === 'signup' && (
            <label>
              Nombre
              <input value={name} onChange={e => setName(e.target.value)} required />
            </label>
          )}
          <label>
            Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>

          <div className="modal-actions">
            <button className="btn" type="submit">{mode === 'login' ? 'Entrar' : 'Crear cuenta'}</button>
            <button type="button" className="btn ghost" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'Crear cuenta' : '¿Ya tienes cuenta? Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
