import React from 'react';

export default function Contact() {
  return (
    <div className="container contact-wrapper">
      <h3>Contacto</h3>

      <p>Teléfono: <strong>+34 691 355 682</strong></p>
      <p>Email: <strong>contacto@natursurmyn.com</strong></p>
      <p>Dirección: Av. Santa Lucía, 62 · 41500 Alcalá de Guadaíra</p>

      <a 
        href="https://wa.me/34691355682" 
        target="_blank" 
        rel="noopener noreferrer"
        className="btn"
      >
        Enviar mensaje por WhatsApp
      </a>
    </div>
  );
}
