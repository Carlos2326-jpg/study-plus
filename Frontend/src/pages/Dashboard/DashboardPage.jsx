import React from "react";
import { useDashboard } from "../../Controllers/dashboardController";
import { useNavigate } from "react-router-dom";
import Button from "../../Components/ui/Button";
import "./Styles/DashboardPage.css";

function DashboardPage() {
  const { dados, loading, erro, porcentagemConclusao } = useDashboard();
  const navigate = useNavigate();

  if (loading)
    return <div className="loading-screen">Carregando painel... 🌱</div>;

  const pendentes = dados.totalTarefas - dados.concluidas;

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        {/* Cabeçalho */}
        <div className="dashboard-header">
          <div>
            <h1>Seu painel 🌱</h1>
            <p>Acompanhe suas tarefas e compromissos de hoje.</p>
          </div>
        </div>

        {erro && <div className="msg-erro">{erro}</div>}

        {/* Métricas */}
        <section className="metrics-grid">
          <div className="metric-card">
            <span className="metric-card__label">Tarefas Pendentes</span>
            <span className="metric-card__number">{pendentes}</span>
            <div className="metric-card__action">
              <button
                className="btn-secondary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                onClick={() => navigate("/tarefas")}
              >
                Ver Tarefas
              </button>
            </div>
          </div>

          <div className="metric-card">
            <span className="metric-card__label">Concluídas</span>
            <span className="metric-card__number metric-card__number--destaque">
              {dados.concluidas}
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-card__label">Progresso Geral</span>
            <span className="metric-card__number">{porcentagemConclusao}%</span>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${porcentagemConclusao}%` }}
              />
            </div>
          </div>
        </section>

        {/* Próximos eventos */}
        <section className="events-section">
          <h2>📆 Próximos eventos</h2>

          {dados.proximosEventos.length === 0 ? (
            <p className="events-empty">
              Nenhum compromisso agendado para os próximos dias.
            </p>
          ) : (
            <ul className="events-list">
              {dados.proximosEventos.map((evento) => (
                <li key={evento.id} className="event-item">
                  <span>{evento.titulo}</span>
                  <span className="event-item__date">
                    {new Date(evento.data).toLocaleDateString("pt-BR")}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="events-action">
            <button
              className="btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              onClick={() => navigate("/calendario")}
            >
              Abrir Calendário
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;