import React from 'react';
import image from '../resources/aboutMe.jpg';

export default function AboutMe() {
  return (
    <div className="container about-wrapper">
      <div className="about-photo">
        <div className="photo-placeholder">
          <img src={image} alt="Fernando" />
        </div>
      </div>
      <div className="about-text">
        <h3>Sobre mí</h3>
        <p>
          Soy <strong>Fernando Escalona</strong>, especialista en bienestar integral 
          con más de 25 años de experiencia ayudando a personas a transformar su 
          salud física, emocional y nutricional.
        </p>

        <p>
          Mi objetivo es acompañarte en un proceso equilibrado donde el cuerpo, 
          la mente y los hábitos trabajan juntos para mejorar tu bienestar.
        </p>
      </div>

    </div>
  );
}
