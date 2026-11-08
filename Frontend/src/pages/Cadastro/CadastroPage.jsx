import React from "react";
import { useNavigate } from "react-router-dom";
import { RegistroForm } from "./Forms/RegistroForm";
import "../../Assets/Styles/Pages/CadastroPage.css";

export const CadastroPage = () => {
  const navigate = useNavigate();
  return (
    <div className="cadastro-page">
      <div className="cadastro-header">
        <div className="cadastro-logo">
          Pro<span>Seeds</span>
        </div>
        <p className="cadastro-tagline">Sua produtividade germina aqui 🌱</p>
      </div>
      <RegistroForm onVoltarLogin={() => navigate("/login")} />
    </div>
  );
};