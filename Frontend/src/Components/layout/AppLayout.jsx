import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../Controllers/authController";
import "../../Assets/Styles/Layout.css";

// Importando as imagens da pasta Assets/images
import IconTarefas from "../../Assets/images/clipboard-check.png";
import IconEstudos from "../../Assets/images/clipboard-check.png"; // Troque se tiver um ícone específico de livro
import IconListas from "../../Assets/images/icon-calendar date event agenda.png"; // Troque se tiver um específico de lista
import IconTimer from "../../Assets/images/icon-clock sand alarm timer.png";
import IconCalendario from "../../Assets/images/icon-calendar date event agenda.png";
import IconProgresso from "../../Assets/images/chart-no-axes-combined.png";
import IconPerfil from "../../Assets/images/icon-user profile silhouette member.png";
import LogoBadge from "../../Assets/images/logo-badge.png";

export default function AppLayout() {
  const { handleLogout } = useAuth();

  // Array com as imagens importadas
  const menuItems = [
    { path: "/tarefas", label: "Tarefas", icon: IconTarefas },
    { path: "/estudos", label: "Estudos", icon: IconEstudos },
    { path: "/listas", label: "Listas", icon: IconListas },
    { path: "/temporizador", label: "Timer", icon: IconTimer },
    { path: "/calendario", label: "Calendário", icon: IconCalendario },
    { path: "/progresso", label: "Progresso", icon: IconProgresso },
    { path: "/perfil", label: "Perfil", icon: IconPerfil },
  ];

  return (
    <div className="app-layout">
      {/* Menu Lateral (Desktop/Tablet) */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          {/* Usando a imagem importada */}
          <img src={LogoBadge} alt="Study+" />
          <span>Study+</span>
        </div>

        <span className="sidebar-section-title">ESPAÇO DE ESTUDO</span>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
            >
              {/* O src agora recebe a imagem importada */}
              <img src={item.icon} alt={item.label} className="sidebar-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>Produtividade sob medida</p>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Menu Inferior (Mobile) */}
      <nav className="bottom-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => isActive ? "bottom-link active" : "bottom-link"}
          >
            <img src={item.icon} alt={item.label} className="bottom-nav-icon" />
            <span className="label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}