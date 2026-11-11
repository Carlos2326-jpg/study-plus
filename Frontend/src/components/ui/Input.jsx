import React, { useState } from "react";
import "../../Assets/Styles/Components/Input.css";

export default function Input({
  type = "text",
  name,
  id,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  maxLength,
  required = false,
  className = "",
  style,
  ...rest
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const inputType = type === "password" && mostrarSenha ? "text" : type;

  return (
    <div className="input-wrapper">
      <input
        type={inputType}
        name={name}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        maxLength={maxLength}
        required={required}
        className={`input-field ${className}`.trim()}
        style={style}
        {...rest}
      />
      
      {type === "password" && (
        <button
          type="button"
          className="input-password-toggle"
          onClick={() => setMostrarSenha((prev) => !prev)}
          tabIndex="-1"
          title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
        >
          {/* Ícone de olho aberto/fechado via SVG para não mudar de tamanho */}
          {mostrarSenha ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      )}
    </div>
  );
}