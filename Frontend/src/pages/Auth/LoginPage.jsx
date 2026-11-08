import React, { useState } from "react";
import { LoginForm } from "./Forms/LoginForm";
import { RecuperarSenhaForm } from "./Forms/RecuperarSenhaForm";
import "../../Assets/Styles/Pages/Login.css";

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