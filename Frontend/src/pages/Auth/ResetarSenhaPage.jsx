import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Controllers/authController";
import Button from "../../Components/ui/Button";
import Input from "../../Components/ui/Input";
import "../../Assets/Styles/Pages/AuthPages.css";

export const ResetarSenhaPage = () => {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const { handleResetPassword, erro, loading } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("@App:reset_token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Sessão expirada. Tente novamente.");
      return navigate("/forgot-password");
    }
    const sucesso = await handleResetPassword(token, novaSenha, confirmarSenha);
    if (sucesso) {
      localStorage.removeItem("@App:reset_token");
      localStorage.removeItem("@App:reset_email");
      alert("Senha alterada com sucesso!");
      navigate("/login");
    }
  };

  return (
    <div className="auth-centered-container">
      <div className="auth-card">
        <h1 className="auth-title">Crie sua nova senha</h1>
        <p className="auth-subtitle">Sua nova senha deve ter no mínimo 8 caracteres.</p>

        {erro && <div className="error-message">{erro}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nova Senha</label>
            <Input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Confirmar Nova Senha</label>
            <Input
              type="password"
              placeholder="Repita a senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading} className="btn-auth">
            {loading ? "Salvando..." : "Confirmar"}
          </Button>
        </form>
      </div>
    </div>
  );
};