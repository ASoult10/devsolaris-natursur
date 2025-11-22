import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutMe from './components/AboutMe';
import Services from './components/Services';
import Booking from './components/Booking';
import Contact from './components/Contact';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import { MyAppointments, MyOrders } from './components/UserPanel';
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
        {/* Hero o saludo si está loggeado */}
        {user ? (
          <section id="welcome" className="section welcome-section">
            <div className="container">
              <h1 className="section-title">Bienvenid@ {user.name}</h1>
              <p className="muted">En tu área personal puedes ver tus citas y pedidos.</p>
            </div>
          </section>
        ) : (
          <Hero 
            onReserveClick={() => {
              const el = document.getElementById('booking');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} 
          />
        )}

        {/* SOBRE MÍ */}
        <section id="sobre-mi" className="section about-section">
          {user ? <MyAppointments user={user} /> : <AboutMe />}
        </section>

        {/* SERVICIOS (o reemplazable por enlaces de usuario en Header) */}
        <section id="servicios" className="section services-section">
          {user ? <MyOrders user={user} /> : <Services />}
        </section>


        {/* Testimonials eliminado según petición */}

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

        {/* ADMIN: solo visible para usuarios ADMIN */}
        {user && user.role === 'ADMIN' && (
          <section id="admin-section">
            <AdminPanel user={user} />
          </section>
        )}

        {/* Si además quieres mantener secciones directas para anclaje, las dejamos pero no son necesarias:
            ya renderizamos MyAppointments/MyOrders en los lugares solicitados. */}
      </main>

      <AuthModal
        key={authOpen ? "open" : "closed"}
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}