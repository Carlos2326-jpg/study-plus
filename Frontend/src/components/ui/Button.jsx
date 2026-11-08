// src/Components/Button.jsx
import React from 'react';
import '../../Assets/Styles/Components/button.css';

function Button({
  type = 'button',
  text,
  children,
  onClick,
  className = 'button',
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${className}`}
      disabled={disabled}
    >
      <span>{text ?? children}</span>
    </button>
  );
}

export default Button;