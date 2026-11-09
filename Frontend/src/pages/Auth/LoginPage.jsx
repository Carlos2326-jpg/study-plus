import React from "react";
import { LoginForm } from "./Forms/LoginForm";
import LogoFocusly from "../../Assets/images/logo-badge.png";
import "../../Assets/Styles/Pages/Login.css";

export const LoginPage = () => {
  return (
    <div className="login-page-container">
      {/* Lado Esquerdo (Visível apenas em telas maiores) */}
      <aside className="login-aside">
        <div className="login-aside-logo">
          <img src={LogoFocusly} alt="Focusly" />
          <span>Focusly</span>
        </div>
        
        <div className="login-aside-content">
          <span className="login-aside-tag">PRODUTIVIDADE SOB MEDIDA</span>
          <h1>Mais foco.<br/>Mais progresso.</h1>
          <p>Organize suas tarefas, planeje seus estudos e acompanhe sua evolução.</p>
        </div>

        <div className="login-aside-footer">
          <p>Seu espaço para aprender e realizar.</p>
        </div>
      </aside>

      {/* Lado Direito (O Formulário) */}
      <main className="login-main">
        <div className="login-form-wrapper">
          {/* No mobile, o logo aparece centralizado em cima do form */}
          <div className="login-mobile-header">
            <img src={LogoFocusly} alt="Focusly" />
            <h2>Focusly</h2>
            <p>Produtividade sob medida</p>
          </div>

          <div className="login-desktop-header">
            <h2>Focusly</h2>
            <p>Produtividade sob medida</p>
          </div>

          <LoginForm />
        </div>
      </main>
    </div>
  );
};