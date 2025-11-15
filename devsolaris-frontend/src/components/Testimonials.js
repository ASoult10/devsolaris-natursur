import React from 'react';

const TESTIMONIOS = [
  { name: 'Antonio Benabal Muela', date: '2025-02-19', text: 'Gran profesional con experiencia y muchos conocimientos...' },
  { name: 'Elvira Muela Lopez', date: '2025-02-19', text: 'La verdad que me ha gustado mucho lo recomiendo' },
  { name: 'jonathan carrasco', date: '2025-02-07', text: 'Buen profesional, para repetir.' }
];

export default function Testimonials() {
  return (
    <section className="section testimonials">
      <div className="container">
        <h3>Opiniones de nuestros clientes</h3>
        <div className="testimonials-list">
          {TESTIMONIOS.map((t, i) => (
            <blockquote key={i} className="testimonial">
              <p>{t.text}</p>
              <footer>{t.name} — <small>{t.date}</small></footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
