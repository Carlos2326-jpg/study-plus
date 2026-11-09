import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../Controllers/authController";
import "../../Assets/Styles/Layout.css";

export default function AppLayout() {
  const { handleLogout } = useAuth();

  const menuItems = [
    { path: "/tarefas", label: "Tarefas", icon: "📋" },
    { path: "/estudos", label: "Estudos", icon: "📚" },
    { path: "/listas", label: "Listas", icon: "📝" },
    { path: "/temporizador", label: "Timer", icon: "⏱" },
    { path: "/calendario", label: "Calendário", icon: "📅" },
    { path: "/progresso", label: "Progresso", icon: "📈" },
    { path: "/perfil", label: "Perfil", icon: "👤" },
  ];

  return (
    <div className="app-layout">
      {/* Menu Lateral (Desktop/Tablet) */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo-focusly.png" alt="Focusly" />
          <span>Focusly</span>
        </div>
        
        <span className="sidebar-section-title">ESPAÇO DE ESTUDO</span>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
            >
              <span className="icon">{item.icon}</span>
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
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}