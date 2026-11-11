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

  // Define o tipo real do input (se for senha e estiver visível, vira texto)
  const inputType = type === "password" && mostrarSenha ? "text" : type;

  return (
    <div className="input-wrapper" style={{ position: "relative", width: "100%" }}>
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
      
      {/* Botão de Mostrar/Ocultar Senha */}
      {type === "password" && (
        <button
          type="button"
          className="input-password-toggle"
          onClick={() => setMostrarSenha((prev) => !prev)}
          tabIndex="-1" // Evita que o botão seja focado ao apertar "Tab"
          title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
        >
          {mostrarSenha ? "Ocultar" : "Mostrar"}
        </button>
      )}
    </div>
  );
}