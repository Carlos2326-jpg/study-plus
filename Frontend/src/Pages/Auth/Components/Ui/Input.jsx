import React from 'react';
import '../../Styles/input.css';

function Input({ type, name, placeholder, value, onChange }) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      className="input-field"
    />
  );
}

export default Input;