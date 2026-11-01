import React, { useState } from "react";
import { useAuth } from "../../../../Controllers/authController";
import "../../Styles/CadastroPage.css";

export const RegistroForm = ({ onVoltarLogin }) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const { handleRegister, erro, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sucesso = await handleRegister(nome, email, senha, confirmarSenha);
    if (sucesso) {
      window.location.href = "/dashboard";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cadastro-form">
      {erro && <div className="error-message">{erro}</div>}

      <div className="form-group">
        <input
          type="text"
          placeholder="Seu nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="form-group">
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="Confirme sua senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          className="input-field"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-login">
        {loading ? "Cadastrando..." : "Criar conta"}
      </button>

      <div className="form-actions">
        <span onClick={onVoltarLogin}>Já tem uma conta? Acesse aqui</span>
      </div>
    </form>
  );
};