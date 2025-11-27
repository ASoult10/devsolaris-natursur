import React from 'react';

import manoIcon from '../resources/mano.png';
import bioIcon from '../resources/bio.png';
import hombreIcon from '../resources/hombre.png';
import nutricionIcon from '../resources/nutricion.png';

const SERVICE_LIST = [
  {
    title: 'Osteopatía y Masajes Holísticos',
    desc: 'Alivia tensiones y mejora tu movilidad.',
    icon: manoIcon
  },
  {
    title: 'Par Biomagnético Equilibrado',
    desc: 'Equilibra la energía de tu cuerpo de manera natural.',
    icon: bioIcon
  },
  {
    title: 'Técnicas Emocionales Adaptadas',
    desc: 'Libera bloqueos emocionales con métodos especializados.',
    icon: hombreIcon
  },
  {
    title: 'Asesoramiento Nutricional',
    desc: 'Mejora tu alimentación y hábitos de forma personalizada.',
    icon: nutricionIcon
  }
];

export default function Services() {
  return (
    <section id="servicios" className="services-section">
      <div className="container">
        <h3 className="section-title">¿Cómo puedo ayudarte?</h3>
        <p className="services-subtitle">
          Más de 25 años de experiencia en técnicas manuales, osteopatía y
          asesoramiento nutricional. Descubre cómo mejorar tu bienestar.
        </p>

        <div className="services-grid">
          {SERVICE_LIST.map((s, i) => (
            <div key={i} className="service-card">
              <div className="service-icon">
                <img src={s.icon} alt={s.title} />
              </div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
              <button className="btn service-btn">Saber más</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
