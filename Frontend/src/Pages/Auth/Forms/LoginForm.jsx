import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Controllers/authController";
import Button from "../../../Components/ui/Button";
import Input from "../../../Components/ui/Input";
import "../../../Assets/Styles/Pages/Forms/LoginForm.css";

export const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { handleLogin, erro, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sucesso = await handleLogin(email, senha);
    if (sucesso) {
      navigate("/dashboard"); // Usando React Router em vez de window.location
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {erro && <div className="error-message">{erro}</div>}

      <div className="form-group">
        <label>E-mail</label>
        <Input
          type="email"
          name="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>Senha</label>
        <Input
          type="password"
          name="senha"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-actions-row">
        <span className="link-esqueceu" onClick={() => navigate("/forgot-password")}>
          Esqueceu a senha?
        </span>
      </div>

      <Button type="submit" disabled={loading} className="btn-entrar">
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <p className="link-cadastro">
        Não tem conta?{" "}
        <span onClick={() => navigate("/register")}>Criar conta</span>
      </p>
    </form>
  );
};