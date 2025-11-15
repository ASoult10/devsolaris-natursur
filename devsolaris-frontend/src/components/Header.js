import React, { useEffect, useState } from 'react';
import AuthModal from './AuthModal';

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

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
            <img src="/logo-natursur.png" alt="Natursur" />
          </a>

          <nav className="nav-links" aria-label="primary">
            <a href="#inicio">INICIO</a>
            <a href="#servicios">SERVICIOS</a>
            <a href="#contacto">CONTACTO</a>
            <a href="https://natursur.herbalife.com/es-es/u" target="_blank" rel="noopener noreferrer">TIENDA</a>
          </nav>

          <div style={{ display: 'flex', gap: '12px', justifySelf: 'end', alignItems: 'center' }}>
            <a className="btn cta" href="#contacto">RESERVA TU CITA</a>
            <button className="profile-btn" onClick={() => setAuthOpen(true)}>👤</button>
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onLogin={() => setAuthOpen(false)} />
    </>
  );
}
