import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Controllers/authController";
import Button from "../../Components/ui/Button";
import "../../Assets/Styles/Pages/AuthPages.css";

export const ValidarCodigoPage = () => {
  const [codigo, setCodigo] = useState("");
  const { handleValidarCodigo, erro, loading } = useAuth();
  const navigate = useNavigate();
  const email = localStorage.getItem("@App:reset_email") || "seu e-mail";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultado = await handleValidarCodigo(email, codigo);
    if (resultado.sucesso) {
      localStorage.setItem("@App:reset_token", resultado.tokenTemporario);
      navigate("/reset-password");
    }
  };

  return (
    <div className="auth-centered-container">
      <div className="auth-card">
        <h1 className="auth-title">Código de Segurança</h1>
        <p className="auth-subtitle">
          Insira o código de 4 dígitos enviado para o seu celular/e-mail para confirmar a identidade.
        </p>

        {erro && <div className="error-message">{erro}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              maxLength={4}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="input-field"
              style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem" }}
              placeholder="0000"
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading} className="btn-auth">
            {loading ? "Validando..." : "Confirmar"}
          </Button>
          
          <span className="auth-link" onClick={() => navigate("/forgot-password")}>
            Reenviar código
          </span>
        </form>
      </div>
    </div>
  );
};