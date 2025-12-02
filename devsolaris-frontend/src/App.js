import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Banner from './components/Banner';
import AboutMe from './components/AboutMe';
import Services from './components/Services';
import Booking from './components/Booking';
import Contact from './components/Contact';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import { MyAppointments, MyOrders } from './components/UserPanel';
import './style.css';
import botIcon from './resources/bot.png'; 

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
    <div className="App">
      <Header 
        onOpenAuth={() => setAuthOpen(true)} 
        user={user} 
        onLogout={handleLogout} 
      />

      <main>

        {user ? (
          <Banner user={user} />
        ) : (
          <Hero 
            onReserveClick={() => {
              const el = document.getElementById('booking');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} 
          />
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
            {/* Si el usuario está logueado, mostramos sus citas. Si no, la sección "Sobre mí" */}
            <section id="sobre-mi" className="section about-section">
              {user ? <MyAppointments user={user} /> : <AboutMe />}
            </section>

            {/* Mostrar servicios solo si el usuario no está logueado */}
            {!user && <Services />}

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

      {/* Botón flotante de Telegram, se muestra solo si el usuario está logueado */}
      {user && !isAdmin && (
        <a 
          href="https://t.me/natursur_bot"
          target="_blank" 
          rel="noopener noreferrer" 
          className="telegram-fab"
          title="Contactar por Telegram"
        >
          <img src={botIcon} alt="Chat de Telegram" />
        </a>
      )}
    </div>
  );
}
