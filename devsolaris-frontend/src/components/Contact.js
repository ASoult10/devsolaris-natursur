import React from 'react';
import logo from '../resources/logo.png';

export default function Contact() {
  return (
    <div className="contact-footer">
      
      <div className="footer-left">
        <img src={logo} alt="Natursur" className="footer-logo" />

        <p className="footer-quote">
          "Cuerpo, mente y alimentación: cuando los tres están en equilibrio, todo cambia."
        </p>
      </div>

      <div className="footer-right">

        <div className="footer-info">
          <p><i className="icon-location"></i> Av. Santa Lucía, 62 · 41500 Alcalá de Guadaíra, Sevilla</p>
          <p><i className="icon-whatsapp"></i> 691 355 682</p>
        </div>

        <a 
          href="https://wa.me/34691355682" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-whatsapp-btn"
        >
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
}
