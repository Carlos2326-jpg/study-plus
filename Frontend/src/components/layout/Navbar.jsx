import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../Controllers/authController";
import { notificacaoService } from "../../Services/notificacaoService";
import "./Navbar.css";

const links = [
  { path: "/dashboard", label: "🏠 Dashboard" },
  { path: "/tarefas", label: "✅ Tarefas" },
  { path: "/calendario", label: "📆 Calendário" },
  { path: "/temporizador", label: "⏱ Temporizador" },
  { path: "/metas", label: "🎯 Metas" },
  { path: "/progresso", label: "📊 Progresso" },
  { path: "/planejamento", label: "📅 Planejamento" },
  { path: "/disciplinas", label: "📚 Disciplinas" },
  { path: "/notificacoes", label: "🔔 Notificações" },
  { path: "/perfil", label: "👤 Perfil" },
];

export default function Navbar() {
  const { handleLogout } = useAuth();
  const location = useLocation();
  const [totalAlertas, setTotalAlertas] = useState(0);

  // Atualiza o contador toda vez que o usuário troca de página
  useEffect(() => {
    let ativo = true;
    notificacaoService
      .listar()
      .then((d) => ativo && setTotalAlertas(d.total))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [location.pathname]);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-leaf">🌱</span>
        <span>
          Pro<span className="brand-accent">Seeds</span>
        </span>
      </div>
      <div className="navbar-links">
        {links.map((l) => (
          <NavLink
            key={l.path}
            to={l.path}
            className={({ isActive }) =>
              isActive ? "nav-link ativo" : "nav-link"
            }
          >
            {l.label}
            {l.path === "/notificacoes" && totalAlertas > 0 && (
              <span className="nav-badge">{totalAlertas}</span>
            )}
          </NavLink>
        ))}
        <button className="nav-logout" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </nav>
  );
}