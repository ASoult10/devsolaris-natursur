import React from 'react';
import logo from '../resources/logo.png';
import whatsappLogo from '../resources/whatsapp.png'; // Asegúrate de tener este logo
import instagramLogo from '../resources/instagram.png';
import tiktokLogo from '../resources/tiktok.png';

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

        {/* Contenedor para los iconos de redes sociales */}
        <div className="footer-actions">
          <div className="social-icons">
            <a href="https://wa.me/34691355682" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Contactar por WhatsApp">
              <img src={whatsappLogo} alt="WhatsApp" className="social-icon" />
            </a>
            <a href="https://www.instagram.com/fernandoescalona78" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Ir a Instagram">
              <img src={instagramLogo} alt="Instagram" className="social-icon" />
            </a>
            <a href="https://www.tiktok.com/@yosoyescalona" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Ir a TikTok">
              <img src={tiktokLogo} alt="TikTok" className="social-icon" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
