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

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="app">
      <Header 
        onOpenAuth={() => setAuthOpen(true)} 
        user={user} 
        onLogout={handleLogout} 
      />

      <main>

        {/*Banner de bienvenida para TODOS los usuarios, incluido ADMIN */}
        {user && (
          <section id="welcome" className="section welcome-section">
            <div className="container">
              <h1 className="section-title">Bienvenid@ {user.name}</h1>
            </div>
          </section>
        )}

        {/* ============================== */}
        {/*        SI ES ADMIN              */}
        {/* ============================== */}
        {isAdmin ? (
          <>
            <section id="admin-section">
              <AdminPanel user={user} />
            </section>
          </>
        ) : (
        /* ============================== */
        /*   SI NO ES ADMIN — WEB NORMAL  */
        /* ============================== */
          <>
            {!user && (
              <Hero 
                onReserveClick={() => {
                  const el = document.getElementById('booking');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
              />
            )}

            <section id="sobre-mi" className="section about-section">
              {user ? <MyAppointments user={user} /> : <AboutMe />}
            </section>

            <section id="servicios" className="section services-section">
              {user ? <MyOrders user={user} /> : <Services />}
            </section>

            <section id="booking" className="section booking-section">
              <Booking 
                user={user} 
                onRequireLogin={() => setAuthOpen(true)} 
              />
            </section>

            <section id="contacto" className="section contact-section">
              <Contact />
            </section>
          </>
        )}
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
