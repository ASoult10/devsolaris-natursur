import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutMe from './components/AboutMe';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import Booking from './components/Booking';
import Contact from './components/Contact';
import AuthModal from './components/AuthModal';
//import './App.css';
import './style.css';

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('natursur_user')) || null;
    } catch {
      return null;
    }
  });

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('natursur_user', JSON.stringify(u));
    setAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('natursur_user');
  };

  return (
    <div className="app">
      <Header 
        onOpenAuth={() => setAuthOpen(true)} 
        user={user} 
        onLogout={handleLogout} 
      />

      <main>
        {/* Hero principal */}
        <Hero 
          onReserveClick={() => {
            const el = document.getElementById('booking');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }} 
        />

        {/* SOBRE MÍ */}
        <section id="sobre-mi" className="section about-section">
          <AboutMe />
        </section>

        {/* SERVICIOS */}
        <section id="servicios" className="section services-section">
          <Services />
        </section>

        {/* TESTIMONIOS */}
        <section className="section testimonials-section">
          <Testimonials />
        </section>

        {/* RESERVA */}
        <section id="booking" className="section booking-section">
          <Booking 
            user={user} 
            onRequireLogin={() => setAuthOpen(true)} 
          />
        </section>

        {/* CONTACTO (similar al footer de la página original) */}
        <section id="contacto" className="section contact-section">
          <Contact />
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>Av. Santa Lucía, 62 · 41500 Alcalá de Guadaíra — +34 691 355 682</p>
          <p>Copyright © 2025. Todos los derechos reservados.</p>
        </div>
      </footer>

      <AuthModal 
        open={authOpen} 
        onClose={() => setAuthOpen(false)} 
        onLogin={handleLogin} 
      />
    </div>
  );
}
