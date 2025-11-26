import React from 'react';
import image from '../resources/banner.png';

export default function Banner({ user }) {
  // Estilos en línea para facilitar la implementación. Se pueden mover a style.css
  const bannerStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    textAlign: 'center',
    padding: '80px 20px', // Más grande y con más espacio
  };

  const titleStyle = {
    fontSize: '3rem', // Título más grande
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)', // Sombra para legibilidad
  };

  const subtitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '300',
    margin: '0',
    opacity: '0.9',
  };

  return (
    <section id="welcome-banner" className="section" style={bannerStyle}>
      <div className="container">
        <h1 style={titleStyle}>Bienvenid@, {user.name}</h1>
        <p style={subtitleStyle}>Es un buen día para empezar a cuidarse.</p>
      </div>
    </section>
  );
}