import React, { useState } from "react";
import "../../Assets/Styles/Pages/EstudosPage.css";
import ModalDisciplinas from "../../Components/Modals/ModalDisciplinas";

// Dados mockados idênticos ao seu protótipo
const estudosMock = [
  {
    id: 1,
    disciplina: "Engenharia de Software",
    data: "Hoje, 17:00",
    prioridade: "Alta",
    progresso: 65,
    corPrioridade: "alta",
  },
  {
    id: 2,
    disciplina: "Banco de Dados (SQL)",
    data: "Amanhã, 10:00",
    prioridade: "Média",
    progresso: 20,
    corPrioridade: "media",
  },
  {
    id: 3,
    disciplina: "Banco de Dados (NoSQL)",
    data: "Atrasada, 10 Out",
    prioridade: "Alta",
    progresso: 90,
    corPrioridade: "alta",
  },
  {
    id: 4,
    disciplina: "Contabilidade",
    data: "15 Out, 18:00",
    prioridade: "Baixa",
    progresso: 0,
    corPrioridade: "baixa",
  },
];

export default function EstudosPage() {
  const [modalAberto, setModalAberto] = useState(false);

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

          {/* Botão que abre o modal no Desktop */}
          <button
            className="btn-novo-estudo desktop-only"
            onClick={() => setModalAberto(true)}
          >
            + Novo estudo
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
        <h2>Meus Estudos</h2>
        <a href="/calendario" className="link-calendario">
          Ver calendário
        </a>
      </div>

      {/* Grid de Cards de Estudo */}
      <div className="estudos-grid">
        {estudosMock.map((estudo) => (
          <div key={estudo.id} className="estudo-card">
            <div className="card-top">
              <div className="card-titulo">
                <div className="icone-disciplina">
                  {/* Ícone de livro */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--purple-main)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <h3>{estudo.disciplina}</h3>
              </div>
              <span className={`badge-prioridade ${estudo.corPrioridade}`}>
                {estudo.prioridade}
              </span>
            </div>

            <div className="card-data">📅 {estudo.data}</div>

            <div className="card-progresso-container">
              <div className="progresso-info">
                <span>Progresso</span>
                <span className="percentual">{estudo.progresso}%</span>
              </div>
              <div className="progresso-bar-bg">
                <div
                  className="progresso-bar-fill"
                  style={{ width: `${estudo.progresso}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão Flutuante (Mobile) - Abre o Modal */}
      <button
        className="fab-novo-estudo mobile-only"
        onClick={() => setModalAberto(true)}
      >
        +
      </button>

      {/* Componente do Modal */}
      <ModalDisciplinas
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      />
    </div>
  );
}
