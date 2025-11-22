import React, { useEffect, useState } from 'react';
import logo from '../resources/logo.png';

export default function Header({ onOpenAuth, user, onLogout }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y - lastY > 5 && y > 20) setHidden(true);
      else if (lastY - y > 5) setHidden(false);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`navbar ${hidden ? 'hidden' : ''}`}>
        <div className="navbar-inner">

          <a className="brand-logo" href="#inicio" aria-label="Natursur">
            <img src={logo} alt="Natursur" />
          </a>

          <div className="nav-right">
            <nav className="nav-links" aria-label="primary">
              <a href="#inicio">INICIO</a>

              {/* Si hay usuario y NO es ADMIN, mostrar Mis citas / Mis pedidos,
                  si no, mostrar los enlaces públicos Servicios / Contacto */}
              {user && user.role !== 'ADMIN' ? (
                <>
                  <a href="#mis-citas">MIS CITAS</a>
                  <a href="#mis-pedidos">MIS PEDIDOS</a>
                </>
              ) : (
                <>
                  <a href="#servicios">SERVICIOS</a>
                  <a href="#contacto">CONTACTO</a>
                </>
              )}

              <a href="https://natursur.herbalife.com/es-es/u" target="_blank" rel="noopener noreferrer">TIENDA</a>
              {user && user.role === 'ADMIN' && <a href="#admin">ADMIN</a>}
            </nav>

            <div className="nav-actions">
              <a className="btn cta" href="#booking">RESERVA TU CITA</a>

              {user ? (
                <>
                  <button
                    className="profile-btn"
                    title={user.name}
                    onClick={() => { /* opcional: abrir perfil */ }}
                  >
                    {user.name?.charAt(0) || '👤'}
                  </button>

                  <button
                    className="btn logout-btn"
                    onClick={onLogout}
                    aria-label="Salir"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#0a9aa2',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: 20,
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Salir
                  </button>
                </>
              ) : (
                <button className="profile-btn" onClick={onOpenAuth}>👤</button>
              )}
            </div>
          </div>

        </div>
      </header>
    </>
  );
}