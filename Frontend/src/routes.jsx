import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./Controllers/authController";
import AppLayout from "./Components/layout/AppLayout";

// AQUI ESTÃO AS CHAVES { } QUE O VITE ESTAVA PEDINDO:
import { LoginPage } from "./Pages/Auth/LoginPage";
import { CadastroPage } from "./Pages/Cadastro/CadastroPage"; 
import { RecuperarSenhaPage } from "./Pages/Auth/RecuperarSenhaPage";
import { ValidarCodigoPage } from "./Pages/Auth/ValidarCodigoPage";
import { ResetarSenhaPage } from "./Pages/Auth/ResetarSenhaPage";

// Telas Internas (Estas usam export default, então NÃO têm chaves)
import TarefasPage from "./Pages/Tarefas/TarefasPage";
import EstudosPage from "./Pages/Estudos/EstudosPage";
import ListasPage from "./Pages/Listas/ListasPage";
import CalendarioPage from "./Pages/Calendario/CalendarioPage";
import ProgressoPage from "./Pages/Progresso/Progresso";
import PerfilPage from "./Pages/Perfil/PerfilPage";
import Temporizador from "./Pages/Temporizador/Temporizador";
import Notificacoes from "./Pages/Notificacoes/Notificacoes"; 

// 404
import NotFoundPage from "./Pages/NotFound/NotFoundPage";

function RotaProtegida() {
  const { usuario, loading } = useAuth();
  
  if (loading) return <div className="loading-screen">Carregando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default function RouterComponent() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<CadastroPage />} />
        <Route path="/forgot-password" element={<RecuperarSenhaPage />} />
        <Route path="/validate-code" element={<ValidarCodigoPage />} />
        <Route path="/reset-password" element={<ResetarSenhaPage />} />

        {/* Rotas Protegidas */}
        <Route element={<RotaProtegida />}>
          <Route path="/tarefas" element={<TarefasPage />} />
          <Route path="/estudos" element={<EstudosPage />} />
          <Route path="/listas" element={<ListasPage />} />
          <Route path="/calendario" element={<CalendarioPage />} />
          <Route path="/temporizador" element={<Temporizador />} />
          <Route path="/progresso" element={<ProgressoPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/notificacoes" element={<Notificacoes />} />
        </Route>

        {/* Redirecionamentos */}
        <Route path="/" element={<Navigate to="/tarefas" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}