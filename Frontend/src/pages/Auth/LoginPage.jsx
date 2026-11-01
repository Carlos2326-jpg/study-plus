import React, { useState } from "react";
import { LoginForm } from "./Components/Forms/LoginForm";
import { RecuperarSenhaForm } from "./Components/Forms/RecuperarSenhaForm";
import "./Styles/LoginForm.css";

export const LoginPage = () => {
  const [modoView, setModoView] = useState("login");

  return (
    <div className="login-page">
      <div className="login-header">
        <div className="login-logo">
          Pro<span>Seeds</span>
        </div>
        <p className="login-tagline">Sua produtividade germina aqui 🌱</p>
      </div>
      {modoView === "login" ? (
        <LoginForm onEsqueceuSenha={() => setModoView("recuperar")} />
      ) : (
        <RecuperarSenhaForm onVoltarLogin={() => setModoView("login")} />
      )}
    </div>
  );
};