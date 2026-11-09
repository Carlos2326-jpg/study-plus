import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Controllers/authController";
import Button from "../../../Components/ui/Button";
import Input from "../../../Components/ui/Input";
import "../../../Assets/Styles/Pages/Forms/RegistroForm.css";

export const RegistroForm = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const { handleRegister, erro, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sucesso = await handleRegister(nome, email, senha, confirmarSenha);
    if (sucesso) {
      navigate("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cadastro-form">
      {erro && <div className="error-message">{erro}</div>}

      <div className="form-group">
        <label>Nome completo</label>
        <Input
          type="text"
          placeholder="Ex: Michelle Oliveira"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={loading}
        />
      </div>

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

      <div className="form-group">
        <label>Senha</label>
        <Input
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>Confirmar Senha</label>
        <Input
          type="password"
          placeholder="Repita a senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          disabled={loading}
        />
      </div>

      <Button type="submit" disabled={loading} className="btn-entrar">
        {loading ? "Cadastrando..." : "Criar Conta"}
      </Button>

      <p className="link-cadastro">
        Já tem conta?{" "}
        <span onClick={() => navigate("/login")}>Entrar</span>
      </p>
    </form>
  );
};