import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Controllers/authController";

// Auth
import { LoginPage } from "./Pages/Auth/LoginPage.jsx";
import { CadastroPage } from "./Pages/Cadastro/CadastroPage.jsx";
import { RecuperarSenhaPage } from "./Pages/Auth/RecuperarSenhaPage.jsx";
import { ValidarCodigoPage } from "./Pages/Auth/ValidarCodigoPage.jsx";
import { ResetarSenhaPage } from "./Pages/Auth/ResetarSenhaPage";

// Páginas internas
import DashboardPage from "./Pages/Dashboard/DashboardPage.jsx";
import TarefasPage from "./Pages/Tarefas/TarefasPage.jsx";
import CalendarioPage from "./Pages/Calendario/CalendarioPage.jsx";

// Área 3
import Temporizador from "./Pages/Temporizador/Temporizador.jsx";
import Metas from "./Pages/Metas/Metas.jsx";
import Progresso from "./Pages/Progresso/Progresso.jsx";
import Planejamento from "./Pages/Planejamento/Planejamento.jsx";
import Navbar from "./Components/layout/Navbar.jsx";
import Disciplinas from "./Pages/Disciplinas/Diciplina.jsx";
import Perfil from "./Pages/Perfil/Perfil.jsx";
import Notificacoes from "./Pages/Notificacoes/Notificacoes.jsx";

const RotaProtegida = ({ children }) => {
  const { usuario, loading } = useAuth();
  if (loading) return <div className="loading-screen">Carregando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
};

const RotaComNav = ({ children }) => (
  <RotaProtegida>
    <Navbar />
    {children}
  </RotaProtegida>
);

const RouterComponent = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<CadastroPage />} />
        <Route path="/forgot-password" element={<RecuperarSenhaPage />} />
        <Route path="/validate-code" element={<ValidarCodigoPage />} />
        <Route path="/reset-password" element={<ResetarSenhaPage />} />

        {/* Rotas protegidas com navbar */}
        <Route
          path="/dashboard"
          element={
            <RotaComNav>
              <DashboardPage />
            </RotaComNav>
          }
        />
        <Route
          path="/tarefas"
          element={
            <RotaComNav>
              <TarefasPage />
            </RotaComNav>
          }
        />
        <Route
          path="/calendario"
          element={
            <RotaComNav>
              <CalendarioPage />
            </RotaComNav>
          }
        />
        <Route
          path="/perfil"
          element={
            <RotaComNav>
              <Perfil />
            </RotaComNav>
          }
        />
        <Route
          path="/temporizador"
          element={
            <RotaComNav>
              <Temporizador />
            </RotaComNav>
          }
        />
        <Route
          path="/metas"
          element={
            <RotaComNav>
              <Metas />
            </RotaComNav>
          }
        />
        <Route
          path="/progresso"
          element={
            <RotaComNav>
              <Progresso />
            </RotaComNav>
          }
        />
        <Route
          path="/planejamento"
          element={
            <RotaComNav>
              <Planejamento />
            </RotaComNav>
          }
        />
                <Route
          path="/disciplinas"
          element={
            <RotaComNav>
              <Disciplinas />
            </RotaComNav>
          }
        />
                <Route
          path="/notificacoes"
          element={
            <RotaComNav>
              <Notificacoes />
            </RotaComNav>
          }
        />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RouterComponent;