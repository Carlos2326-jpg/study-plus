import React from "react";
import "../../Assets/Styles/Components/Button.css";

export default function Button({
  type = "button",
  text,
  children,
  onClick,
  className = "",
  disabled = false,
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${className}`.trim()}
      disabled={disabled}
      {...rest}
    >
      <span>{text ?? children}</span>
    </button>
  );
}