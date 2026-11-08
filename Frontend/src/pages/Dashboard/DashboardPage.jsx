import React from "react";
import { useDashboard } from "../../Controllers/dashboardController";
import { useNavigate } from "react-router-dom";
import { formatarData } from "../../Utils/formatters";
import "../../Assets/Styles/Pages/DashboardPage.css";

function DashboardPage() {
  const { dados, loading, erro, porcentagemConclusao } = useDashboard();
  const navigate = useNavigate();

  if (loading)
    return <div className="loading-screen">Carregando painel... 🌱</div>;

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        {/* Cabeçalho */}
        <div className="dashboard-header">
          <div>
            <h1>Seu painel 🌱</h1>
            <p>Acompanhe suas tarefas, seu tempo de estudo e seus compromissos.</p>
          </div>
        </div>

        {erro && <div className="msg-erro">{erro}</div>}

        {/* Métricas */}
        <section className="metrics-grid">
          <div className="metric-card">
            <span className="metric-card__label">Tarefas Pendentes</span>
            <span className="metric-card__number">{dados.pendentes}</span>
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
            <span className="metric-card__label">Em andamento</span>
            <span className="metric-card__number">{dados.emAndamento}</span>
          </div>

          <div className="metric-card">
            <span className="metric-card__label">Concluídas</span>
            <span className="metric-card__number metric-card__number--destaque">
              {dados.concluidas}
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-card__label">Atrasadas</span>
            <span
              className="metric-card__number"
              style={dados.atrasadas > 0 ? { color: "#dc2626" } : undefined}
            >
              {dados.atrasadas}
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-card__label">Estudado na semana</span>
            <span className="metric-card__number">{dados.horasSemana}h</span>
          </div>

          <div className="metric-card">
            <span className="metric-card__label">Estudado no mês</span>
            <span className="metric-card__number">{dados.horasMes}h</span>
          </div>

          <div className="metric-card">
            <span className="metric-card__label">Metas</span>
            <span className="metric-card__number">
              {dados.metas.atingidas}/{dados.metas.total}
            </span>
            <span className="metric-card__label">
              {dados.metas.ativas} ativa{dados.metas.ativas === 1 ? "" : "s"}
            </span>
            <div className="metric-card__action">
              <button
                className="btn-secondary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                onClick={() => navigate("/metas")}
              >
                Ver Metas
              </button>
            </div>
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
                  <span className="event-item__date">{formatarData(evento.data)}</span>
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