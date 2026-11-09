import React from "react";
import "../../Assets/Styles/Pages/ListasPage.css";

// Dados mockados baseados no protótipo
const categoriasMock = [
  {
    id: 1,
    nome: "Trabalho",
    cor: "var(--purple-dark)",
    totalTarefas: 12,
    tarefas: [
      { id: 1, titulo: "Definir metas Focusly Q4", prazo: "Hoje", concluida: false },
      { id: 2, titulo: "Entregar código para revisão", prazo: "Amanhã", concluida: true },
    ],
  },
  {
    id: 2,
    nome: "Pessoal",
    cor: "var(--grafico-roxo-medio)",
    totalTarefas: 8,
    tarefas: [
      { id: 3, titulo: "Fazer compras de supermercado", prazo: "14 Out", concluida: false },
    ],
  },
  {
    id: 3,
    nome: "Estudos",
    cor: "var(--grafico-laranja)",
    totalTarefas: 6,
    tarefas: [
      { id: 4, titulo: "Ler artigo sobre IA cognitiva", prazo: "16 Out", concluida: false },
    ],
  },
  {
    id: 4,
    nome: "Saúde",
    cor: "var(--grafico-vermelho-claro)",
    totalTarefas: 4,
    tarefas: [
      { id: 5, titulo: "Consulta médica anual", prazo: "20 Out", concluida: false },
    ],
  },
];

export default function ListasPage() {
  return (
    <div className="listas-container">
      
      {/* Cabeçalho */}
      <div className="listas-header">
        <h1>Listas</h1>
        <button className="btn-ordenar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="10" x2="3" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="21" y1="18" x2="3" y2="18"></line>
          </svg>
          Ordenar por
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="listas-busca-wrapper">
        <span className="icone-busca">🔍</span>
        <input 
          type="text" 
          className="listas-input-busca" 
          placeholder="Buscar tarefa ou lista..." 
        />
      </div>

      {/* Grid de Categorias e Tarefas */}
      <div className="listas-grid">
        {categoriasMock.map((cat) => (
          <div key={cat.id} className="grupo-lista">
            
            {/* Header da Categoria */}
            <div className="grupo-header">
              <div className="grupo-titulo">
                <span className="bolinha-cor" style={{ background: cat.cor }}></span>
                <h2>{cat.nome}</h2>
              </div>
              <div className="grupo-info">
                <span className="qtd-tarefas">{cat.totalTarefas} tarefas</span>
                <button className="btn-seta">›</button>
              </div>
            </div>

            {/* Lista de Tarefas da Categoria */}
            <div className="grupo-tarefas">
              {cat.tarefas.map((tarefa) => (
                <div key={tarefa.id} className="item-tarefa">
                  <div className="tarefa-checkbox">
                    {/* Simula o quadradinho de check (preenchido se concluída) */}
                    <div className={`quadrado ${tarefa.concluida ? "marcado" : ""}`}></div>
                  </div>
                  <div className="tarefa-textos">
                    <span className={`tarefa-titulo ${tarefa.concluida ? "riscado" : ""}`}>
                      {tarefa.titulo}
                    </span>
                    <span className="tarefa-prazo">Prazo: {tarefa.prazo}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}