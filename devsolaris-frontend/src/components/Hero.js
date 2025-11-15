import React from 'react';

export default function Hero({ onReserveClick }) {
  return (
    <>
      <section className="hero section">
        <div className="container hero-inner">
          <div className="hero-content">
            <h2>El bienestar es una decisión, y empieza hoy</h2>
            <p>Con más de 25 años de experiencia, te ayudo a alcanzar un equilibrio entre cuerpo, mente y alimentación.</p>
            <div className="hero-ctas">
              <button className="btn link" onClick={onReserveClick}>Reserva tu sesión ahora</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="placeholder-image">Imagen</div>
          </div>
        </div>
      </section>

      <section className="hero-quote section-dark">
        <div className="container">
          <h3>Fernando Escalona</h3>
          <p>«Cuerpo, mente y alimentación: cuando los tres están en equilibrio, todo cambia. No se trata solo de aliviar un dolor o perder peso, sino de entender cómo funciona tu cuerpo y darle lo que necesita. Mi objetivo es guiarte en este proceso de transformación, porque cuando aprendes a cuidarte, todo en tu vida mejora.»</p>
        </div>
      </section>
    </>
  );
}
