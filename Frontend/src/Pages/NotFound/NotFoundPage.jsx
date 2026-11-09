import React from "react";
import { Link } from "react-router-dom";
import "../../Assets/Styles/Pages/NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="notfound-page">
      <h1>404</h1>
      <p>Página não encontrada.</p>
      <Link to="/dashboard" className="notfound-link">Voltar ao painel</Link>
    </div>
  );
}