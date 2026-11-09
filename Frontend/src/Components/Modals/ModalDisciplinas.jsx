import React, { useState } from "react";
import "../../Assets/Styles/Components/ModalDisciplinas.css";

export default function ModalDisciplinas({ isOpen, onClose }) {
  const [novaDisciplina, setNovaDisciplina] = useState("");
  
  // Dados mockados (depois você pode substituir pela chamada à sua API)
  const [disciplinas, setDisciplinas] = useState([
    { id: 1, nome: "Engenharia de Software" },
    { id: 2, nome: "Banco de Dados (SQL)" },
    { id: 3, nome: "Banco de Dados (NoSQL)" },
    { id: 4, nome: "Contabilidade" },
  ]);

  if (!isOpen) return null;

  const handleAdicionar = (e) => {
    e.preventDefault();
    if (!novaDisciplina.trim()) return;
    
    // Adiciona a nova disciplina à lista (mock)
    setDisciplinas([
      ...disciplinas, 
      { id: Date.now(), nome: novaDisciplina.trim() }
    ]);
    setNovaDisciplina("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* O evento onClick no container do modal evita que o clique feche o modal */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Alça de arrastar (Mobile) */}
        <div className="modal-drag-handle mobile-only"></div>

        <div className="modal-header">
          <h2>Nova Disciplina</h2>
          <button className="btn-fechar" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleAdicionar}>
          <div className="input-group-add">
            <input
              type="text"
              placeholder="Escreva o nome da disciplina"
              value={novaDisciplina}
              onChange={(e) => setNovaDisciplina(e.target.value)}
            />
            <button type="submit" className="btn-add-circle">+</button>
          </div>
        </form>

        <div className="lista-disciplinas-box">
          {disciplinas.map((disc) => (
            <div key={disc.id} className="disciplina-item">
              <div className="disciplina-info">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span>{disc.nome}</span>
              </div>
              <div className="disciplina-acoes">
                <button className="btn-acao btn-edit">Editar</button>
                <button className="btn-acao btn-delete">Excluir</button>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-salvar">
            Salvar disciplina
          </button>
        </div>

      </div>
    </div>
  );
}