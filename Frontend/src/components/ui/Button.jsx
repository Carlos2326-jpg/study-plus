// src/Components/Button.jsx
import React from 'react';
import '../../Assets/Styles/button.css';

function Button({
  type = 'button',
  text,
  onClick,
  className = 'button',
  disabled = false,
  imgSrc = null,      // Caminho da imagem
  imgAlt = null,   // Texto alternativo
  imgPosition = 'right' // Posição: 'left' ou 'right'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${className}`}
      disabled={disabled}
    >
      {imgPosition === 'left' && imgSrc && (
        <img src={imgSrc} alt={imgAlt} className="btn-img" />
      )}
      <span>{text}</span>
      {imgPosition === 'right' && imgSrc && (
        <img src={imgSrc} alt={imgAlt} className="btn-img" />
      )}
    </button>
  );
}

export default Button;