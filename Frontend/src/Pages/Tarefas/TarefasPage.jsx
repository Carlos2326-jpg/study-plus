import React from "react";
import "../../Assets/Styles/Pages/EstudosPage.css";

const tarefasMock = [
  {
    id: 1,
    titulo: "Revisar protótipo Focusly",
    categoria: "Design",
    data: "Hoje, 17:00",
    prioridade: "Alta",
    progresso: 65,
    corPrioridade: "alta",
  },
  {
    id: 2,
    titulo: "Gravar vídeo pitch",
    categoria: "Marketing",
    data: "Amanhã, 10:00",
    prioridade: "Média",
    progresso: 20,
    corPrioridade: "media",
  },
  {
    id: 3,
    titulo: "Ajustar banco de dados",
    categoria: "Engenharia",
    data: "Atrasada, 10 Out",
    prioridade: "Alta",
    progresso: 90,
    corPrioridade: "alta",
  },
  {
    id: 4,
    titulo: "Organizar rotina semanal",
    categoria: "Pessoal",
    data: "15 Out, 18:00",
    prioridade: "Baixa",
    progresso: 0,
    corPrioridade: "baixa",
  },
];

export default function TarefasPage() {
  return (
    <div className="estudos-container">
      
      {/* Header da Página */}
      <div className="estudos-header">
        <div className="estudos-greeting">
          <h1>Olá, Michelle 👋</h1>
          <p>Você tem 4 tarefas para hoje</p>
        </div>

        {/* Botão de Notificação e Ação (Desktop) */}
        <div className="estudos-header-actions">
          <button className="btn-notificacao">
            🔔 <span className="dot-notif"></span>
          </button>
          <button className="btn-novo-estudo desktop-only">
            + Nova tarefa
          </button>
        </div>
      </div>

      {/* Filtros (Tabs) */}
      <div className="estudos-filtros">
        <button className="filtro-btn active">Todas</button>
        <button className="filtro-btn">Hoje</button>
        <button className="filtro-btn">Esta Semana</button>
        <button className="filtro-btn">Atrasadas</button>
      </div>

      {/* Título da Seção */}
      <div className="estudos-secao-header">
        <h2>Minhas Tarefas</h2>
        <a href="/calendario" className="link-calendario">Ver calendário</a>
      </div>

      {/* Grid de Cards */}
      <div className="estudos-grid">
        {tarefasMock.map((tarefa) => (
          <div key={tarefa.id} className="estudo-card">
            
            <div className="card-top">
              <div className="card-titulo" style={{ alignItems: 'flex-start' }}>
                <div className="icone-disciplina" style={{ marginTop: '2px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <div className="titulo-e-categoria">
                  <h3>{tarefa.titulo}</h3>
                  <span className="card-categoria">{tarefa.categoria}</span>
                </div>
              </div>
              <span className={`badge-prioridade ${tarefa.corPrioridade}`}>
                {tarefa.prioridade}
              </span>
            </div>

            <div className="card-data">
              📅 {tarefa.data}
            </div>

            <div className="card-progresso-container">
              <div className="progresso-info">
                <span>Progresso</span>
                <span className="percentual">{tarefa.progresso}%</span>
              </div>
              <div className="progresso-bar-bg">
                <div 
                  className="progresso-bar-fill" 
                  style={{ width: `${tarefa.progresso}%` }}
                ></div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Botão Flutuante (Mobile) */}
      <button className="fab-novo-estudo mobile-only">
        +
      </button>

    </div>
  );
}