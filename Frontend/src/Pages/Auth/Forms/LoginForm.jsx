import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Controllers/authController";
import "../../../Assets/Styles/Pages/Forms/LoginForm.css";

export const LoginForm = ({ onEsqueceuSenha }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { handleLogin, erro, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sucesso = await handleLogin(email, senha);
    if (sucesso) {
      window.location.href = "/dashboard";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {erro && <div className="error-message">{erro}</div>}

      <div className="form-group">
        <input
          type="email"
          name="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          name="senha"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="input-field"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-login">
        {loading ? "Carregando..." : "Entrar"}
      </button>

      <div className="form-actions">
        <span onClick={() => navigate("/forgot-password")}>
          Esqueceu a senha?
        </span>
        <span onClick={() => navigate("/register")}>
          Deseja criar uma conta?
        </span>
      </div>
    </form>
  );
};