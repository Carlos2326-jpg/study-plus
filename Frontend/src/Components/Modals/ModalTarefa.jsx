import React, { useState } from "react";
import "../../Assets/Styles/Components/ModalTarefa.css";

export default function ModalTarefa({ isOpen, onClose, tipo = "tarefa" }) {
  // tipo = "tarefa" (mostra Categoria)
  // tipo = "estudo" (mostra Subtarefas)

  const [prioridade, setPrioridade] = useState("media");
  const [subtarefas, setSubtarefas] = useState([]);
  const [novaSubtarefa, setNovaSubtarefa] = useState("");

  if (!isOpen) return null;

  const isEstudo = tipo === "estudo";
  const tituloModal = isEstudo ? "Novo estudo" : "Nova Tarefa";
  const botaoSalvar = isEstudo ? "Salvar estudo" : "Salvar Tarefa";

  const handleAddSubtarefa = () => {
    if (!novaSubtarefa.trim()) return;
    setSubtarefas([
      ...subtarefas,
      { id: Date.now(), titulo: novaSubtarefa.trim() },
    ]);
    setNovaSubtarefa("");
  };

  const handleRemoverSubtarefa = (id) => {
    setSubtarefas(subtarefas.filter((sub) => sub.id !== id));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-tarefa-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Alça de arrastar (Mobile) */}
        <div className="modal-drag-handle mobile-only"></div>

        <div className="modal-header">
          <h2>{tituloModal}</h2>
          <button className="btn-fechar" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body-scroll">
          {/* Título */}
          <div className="input-group">
            <label>Título {isEstudo ? "do estudo" : "da Tarefa"}</label>
            <input
              type="text"
              className="input-modal"
              placeholder={
                isEstudo
                  ? "Escreva o nome do estudo..."
                  : "Escreva o nome da tarefa..."
              }
            />
          </div>

          {/* Data e Hora */}
          <div className="form-row-2col">
            <div className="input-group">
              <label>Data Limite</label>
              <div className="input-with-icon">
                <span className="icon">📅</span>
                <input type="date" className="input-modal" />
              </div>
            </div>
            <div className="input-group">
              <label>Horário</label>
              <div className="input-with-icon">
                <span className="icon">🕐</span>
                <input type="time" className="input-modal" />
              </div>
            </div>
          </div>

          {/* Prioridade */}
          <div className="input-group">
            <label>Prioridade</label>
            <div className="prioridade-botoes">
              <button
                className={`btn-prioridade ${prioridade === "baixa" ? "active baixa" : ""}`}
                onClick={() => setPrioridade("baixa")}
              >
                <span className="dot"></span> Baixa
              </button>
              <button
                className={`btn-prioridade ${prioridade === "media" ? "active media" : ""}`}
                onClick={() => setPrioridade("media")}
              >
                <span className="dot"></span> Média
              </button>
              <button
                className={`btn-prioridade ${prioridade === "alta" ? "active alta" : ""}`}
                onClick={() => setPrioridade("alta")}
              >
                <span className="dot"></span> Alta
              </button>
            </div>
          </div>

          {/* DIFERENCIAL: Categoria (Tarefas) vs Subtarefas (Estudos) */}
          {isEstudo ? (
            // TELA DE ESTUDOS -> Mostra Subtarefas
            <div className="input-group">
              <label>Subtarefas</label>
              <div className="subtarefa-add-row">
                <input
                  type="text"
                  className="input-modal input-sub"
                  placeholder="Subtarefas"
                  value={novaSubtarefa}
                  onChange={(e) => setNovaSubtarefa(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddSubtarefa())
                  }
                />
                <button className="btn-add-sub" onClick={handleAddSubtarefa}>
                  +
                </button>
              </div>

              {subtarefas.length > 0 && (
                <div className="subtarefas-lista">
                  {subtarefas.map((sub) => (
                    <div key={sub.id} className="subtarefa-item">
                      <span>• {sub.titulo}</span>
                      <button onClick={() => handleRemoverSubtarefa(sub.id)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // TELA DE TAREFAS -> Mostra Categoria
            <div className="input-group">
              <label>Categoria</label>
              <div className="input-with-icon">
                <span className="icon">📁</span>
                <select className="input-modal select-categoria">
                  <option value="">Selecione uma categoria...</option>
                  <option value="design">Design de Interface</option>
                  <option value="marketing">Marketing</option>
                  <option value="engenharia">Engenharia</option>
                  <option value="pessoal">Pessoal</option>
                </select>
                <span className="icon-chevron">v</span>
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="input-group">
            <label>Notas / Descrição</label>
            <textarea
              className="input-modal textarea"
              placeholder="Escreva detalhes opcionais..."
              rows={3}
            ></textarea>
          </div>
        </div>

        {/* Rodapé */}
        <div className="modal-footer-tarefa">
          <button
            type="button"
            className="btn-cancelar-tarefa"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button type="button" className="btn-salvar-tarefa">
            {botaoSalvar}
          </button>
        </div>
      </div>
    </div>
  );
}
