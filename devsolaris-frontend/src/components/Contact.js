import React from 'react';
import logo from '../resources/logo.png';
import tiktokIcon from '../resources/tiktok.png';
import instagramIcon from '../resources/instagram.png';
import whatsappIcon from '../resources/whatsapp.png';

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

        {/* 2. Añadir el botón de WhatsApp junto a los otros */}
        <div className="footer-socials">
          <a href="https://www.tiktok.com/@yosoyescalona" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
            <img src={tiktokIcon} alt="TikTok" />
          </a>
          <a href="https://www.instagram.com/fernandoescalona78" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
            <img src={instagramIcon} alt="Instagram" />
          </a>
          <a href="https://wa.me/34691355682" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
            <img src={whatsappIcon} alt="WhatsApp" />
          </a>
        </div>

        {/* 3. Se elimina el botón de texto anterior */}
      </div>
    </div>
  );
}
