import React, { useState } from "react";
import "../../Assets/Styles/Pages/ProgressoPage.css";

export default function ProgressoPage() {
  // --- Estados de Filtro ---
  const [abaAtiva, setAbaAtiva] = useState("semana");
  
  // Mock dos dados (Substitua pela resposta do seu relatorioController)
  const temRegistros = true; 
  
  const resumo = {
    horasEstudadas: 12,
    tarefasConcluidas: 18,
    totalTarefas: 24,
    percentualTarefas: 75,
  };

  const ritmoSemanal = [
    { dia: "Seg", valor: 1.5 },
    { dia: "Ter", valor: 2 },
    { dia: "Qua", valor: 1 },
    { dia: "Qui", valor: 2.5 },
    { dia: "Sex", valor: 2 },
    { dia: "Sáb", valor: 3, destaque: true }, // Dia com maior foco
    { dia: "Dom", valor: 0 },
  ];

  const tempoPorDisciplina = [
    { nome: "Matemática", horas: 6, percentual: 50, cor: "var(--purple-dark)" },
    { nome: "Física", horas: 4, percentual: 33.3, cor: "var(--purple-main)" },
    { nome: "Redação", horas: 2, percentual: 16.7, cor: "var(--purple-light)" },
  ];

  return (
    <div className="progresso-container">
      
      {/* 1. Header com Título e Ícone */}
      <div className="progresso-header-top">
        <div className="progresso-title-group">
          <div className="logo-icon-small">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--branco)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <h1>Produtividade</h1>
        </div>
        <button className="btn-icone-quadrado">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>
      </div>

      {/* 2. Tabs */}
      <div className="progresso-tabs">
        <button className={abaAtiva === "semana" ? "active" : ""} onClick={() => setAbaAtiva("semana")}>Semana</button>
        <button className={abaAtiva === "mes" ? "active" : ""} onClick={() => setAbaAtiva("mes")}>Mês</button>
        <button className={abaAtiva === "ano" ? "active" : ""} onClick={() => setAbaAtiva("ano")}>Ano</button>
      </div>

      {/* 3. Controles de Data */}
      <div className="progresso-controles">
        <div className="controle-data">
          <button className="btn-seta">‹</button>
          <span>📅 12 – 18 out. 2026</span>
          <button className="btn-seta">›</button>
        </div>
        <div className="controle-filtros">
          <button className="btn-filtro-disciplina">Todas as disciplinas ⌄</button>
          <span className="txt-registros">Todos os registros</span>
        </div>
      </div>

      {/* 4. Resumo Cards */}
      <div className="progresso-resumo-grid">
        <div className="card-resumo-destaque">
          <span className="lbl">Horas estudadas</span>
          <div className="valor-linha">
            <span className="val-grande">{resumo.horasEstudadas} h</span>
            <span className="val-pequeno">na semana</span>
          </div>
        </div>
        <div className="card-resumo-branco">
          <span className="lbl">Tarefas concluídas</span>
          <div className="valor-linha">
            <span className="val-grande">{resumo.tarefasConcluidas}</span>
            <span className="val-pequeno">de {resumo.totalTarefas} · {resumo.percentualTarefas}%</span>
          </div>
        </div>
      </div>

      {/* 5. Gráficos Lado a Lado */}
      <div className="progresso-graficos-grid">
        
        {/* Card: Seu Ritmo de Estudo */}
        <div className="card-grafico">
          <div className="card-header-flex">
            <h3>Seu ritmo de estudo</h3>
            <span className="legenda">Horas por dia</span>
          </div>
          <div className="bar-chart-container">
            {ritmoSemanal.map((item, index) => (
              <div key={index} className="bar-column">
                <span className="bar-value">{item.valor}</span>
                <div className="bar-wrapper">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      height: `${(item.valor / 3) * 100}%`, 
                      background: item.destaque ? "var(--purple-dark)" : "var(--purple-light)" 
                    }}
                  ></div>
                </div>
                <span className="bar-label">{item.dia}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card: Tempo por Disciplina */}
        <div className="card-disciplinas">
          <h3>Tempo por disciplina</h3>
          <div className="lista-disciplinas">
            {tempoPorDisciplina.map((disc, index) => (
              <div key={index} className="disciplina-row">
                <span className="disc-nome">{disc.nome}</span>
                <div className="disc-bar-bg">
                  <div 
                    className="disc-bar-fill" 
                    style={{ width: `${disc.percentual}%`, background: disc.cor }}
                  ></div>
                </div>
                <span className="disc-tempo">{disc.horas} h · {disc.percentual}%</span>
              </div>
            ))}
          </div>
          <div className="alerta-maior-tempo">
            <span className="icone-trofeu">🏆</span>
            <span>Maior tempo: Matemática · 6 h</span>
          </div>
        </div>
      </div>

      {/* 6. Painel de Resumo */}
      <div className="card-painel-resumo">
        <div className="painel-header">
          <strong>Painel de resumo</strong>
          <span className="seta">↗</span>
        </div>
        <p className="painel-txt">Tarefas: 18 de 24 · Meta de estudo: 12 de 16 h</p>
        <div className="painel-progresso-bg">
          <div className="painel-progresso-fill" style={{ width: '75%' }}></div>
        </div>
      </div>

      {/* 7. Botão de Relatório */}
      <button className="btn-relatorio-detalhado">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        Ver relatório detalhado <span>→</span>
      </button>

    </div>
  );
}