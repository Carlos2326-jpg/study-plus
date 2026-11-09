import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Controllers/authController";
import Button from "../../Components/ui/Button";
import Input from "../../Components/ui/Input";
import "../../Assets/Styles/Pages/AuthPages.css";

// Exportação nomeada (com const) - garanta que o import no routes bata com isso
export const RecuperarSenhaPage = () => {
  const [email, setEmail] = useState("");
  const { handleForgotPassword, erro, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultado = await handleForgotPassword(email);
    if (resultado.sucesso) {
      localStorage.setItem("@App:reset_email", email);
      navigate("/validate-code");
    }
  };

  return (
    <div className="auth-centered-container">
      <div className="auth-card">
        
        {/* Ícone do Envelope (simulando o protótipo) */}
        <div className="auth-icon-circle">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--purple-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        <h1 className="auth-title">Verifique seu e-mail</h1>
        <p className="auth-subtitle">
          Para continuar com a alteração da sua senha, informe o e-mail cadastrado em sua conta. Assim, poderemos prosseguir com o processo de recuperação.
        </p>

        {erro && <div className="error-message">{erro}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>E-mail</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading} className="btn-auth">
            {loading ? "Enviando..." : "Enviar Código"}
          </Button>
          
          <span className="auth-link" onClick={() => navigate("/login")}>
            Voltar ao login
          </span>
        </form>
      </div>
    </div>
  );
};