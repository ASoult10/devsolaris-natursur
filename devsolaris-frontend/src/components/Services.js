import React from 'react';

const SERVICE_LIST = [
  { title: 'Osteopatía y Masajes Holísticos', desc: 'Alivia tensiones y mejora tu movilidad.' },
  { title: 'Par Biomagnético Equilibrado', desc: 'Equilibra la energía de tu cuerpo de manera natural.' },
  { title: 'Técnicas Emocionales Adaptadas', desc: 'Libera bloqueos emocionales con métodos especializados.' },
  { title: 'Asesoramiento Nutricional', desc: 'Mejora tu alimentación y hábitos de forma personalizada.' }
];

export default function Services() {
  return (
    <section id="servicios" className="section">
      <div className="container">
        <h3 className="section-title">¿Cómo puedo ayudarte?</h3>
        <div className="services-grid">
          {SERVICE_LIST.map((s, i) => (
            <div key={i} className="service-card">
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
