// src/configs/RoutesConfig.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Login/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PerfilPage from './pages/Perfil/PerfilPage';

import TarefasPage from "../Pages/Tarefas/TarefasPage.js";
import CalendarioPage from "../Pages/Calendario/CalendarioPage.js";

const routes = [
  { path: '/login', element: <LoginPage />, private: false },
  { path: '/register', element: <RegisterPage />, private: false },
  { path: '/dashboard', element: <DashboardPage />, private: true },
  { path: '/perfil', element: <PerfilPage />, private: true },
];

function RoutesConfig() {
  return (
    <Routes>
      {/* Rotas públicas */}
      {routes.filter(r => !r.private).map((route, index) => (
        <Route
          key={index}
          path={route.path}
          element={route.element}
        />
      ))}

      {/* Rotas privadas (com layout) */}
      {routes.filter(r => r.private).map((route, index) => (
        <Route
          key={index}
          path={route.path}
          element={
            <ProtectedRoute>
              <Layout>
                {route.element}
              </Layout>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Redirecionamento padrão */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Rota 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

const rotasArea2 = [
  {
    path: "/tarefas",
    element: <TarefasPage />,
  },
  {
    path: "/calendario",
    element: <CalendarioPage />,
  },
];

export default rotasArea2;
