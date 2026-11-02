import { tarefaService, subtarefaService } from "../../Services/tarefaService.js";
import { useState } from "react";
import {
  toggleSubtarefa, excluirSubtarefa, criarSubtarefa,
  calcularProgresso, alterarStatusTarefa, excluirTarefa,
} from "../../Controllers/tarefaController.js";
import { formatarData } from "../../Utils/formatters";

const prioridadeCor = { alta: "#dc2626", media: "#d97706", baixa: "#16a34a" };

const TarefaCard = ({ tarefa, disciplinas = [], subtarefasState = [], setSubtarefas, setTarefas, onEditar }) => {
  const [expandido, setExpandido] = useState(false);
  const [novaSubtarefa, setNovaSubtarefa] = useState("");

  const disciplina = disciplinas.find((d) => d.id == tarefa.disciplina_id);
  const progresso = calcularProgresso(tarefa.id, subtarefasState);
  const subtarefasDaTarefa = subtarefasState.filter((s) => s.tarefa_id === tarefa.id);

  const handleAdicionarSubtarefa = () => {
    if (!novaSubtarefa.trim()) return;
    criarSubtarefa(tarefa.id, novaSubtarefa, setSubtarefas);
    setNovaSubtarefa("");
  };

  const handleExcluirTarefa = async () => {
    if (window.confirm("Deseja excluir esta tarefa?")) {
      try {
        await tarefaService.excluir(tarefa.id);
        excluirTarefa(tarefa.id, setTarefas, setSubtarefas);
      } catch (err) {
        console.error("Erro ao excluir tarefa:", err);
        alert("Erro ao excluir tarefa. Verifique se o servidor está rodando.");
      }
    }
  };

  return (
    <div className="tc-card">

      <div className="tc-linha">
        <div className="tc-info">
          <span className="tc-titulo">{tarefa.titulo}</span>
          <div className="tc-detalhes">
            {tarefa.prazo && <span className="tc-detalhe">📅 {formatarData(tarefa.prazo)}</span>}
            {disciplina  && <span className="tc-detalhe">📚 {disciplina.nome}</span>}
            <span className="tc-detalhe tc-prioridade" style={{ color: prioridadeCor[tarefa.prioridade] }}>
              🔰 {tarefa.prioridade}
            </span>
          </div>
        </div>

        <div className="tc-acoes">
          <select
            className="tc-select-status"
            value={tarefa.status}
            onChange={async (e) => {
              const novoStatus = e.target.value;
              alterarStatusTarefa(tarefa.id, novoStatus, setTarefas);
              try { await tarefaService.atualizar(tarefa.id, { ...tarefa, status: novoStatus }); }
              catch (err) { console.error("Erro ao atualizar status:", err); }
            }}
          >
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
          </select>
          <div className="tc-botoes">
            <button className="tc-btn-deletar" onClick={handleExcluirTarefa}>Deletar</button>
            <button className="tc-btn-editar" onClick={() => onEditar(tarefa)}>Editar</button>
          </div>
        </div>
      </div>

      {subtarefasDaTarefa.length > 0 && (
        <div className="tc-progresso-container">
          <div className="tc-progresso-track">
            <div className="tc-progresso-fill" style={{ width: `${progresso}%` }} />
          </div>
          <span className="tc-progresso-texto">{progresso}%</span>
        </div>
      )}

      {subtarefasDaTarefa.length > 0 && (
        <button className="tc-btn-expandir" onClick={() => setExpandido(!expandido)}>
          {expandido ? "▲ Ocultar subtarefas" : "▼ Ver subtarefas"}
        </button>
      )}

      {expandido && (
        <div className="tc-subtarefas">
          {subtarefasDaTarefa.map((sub) => (
            <div key={sub.id} className="tc-sub-item">
              <input
                type="checkbox"
                checked={sub.concluida}
                onChange={async () => {
                  toggleSubtarefa(sub.id, setSubtarefas);
                  try { await subtarefaService.atualizar(sub.id, { ...sub, concluida: !sub.concluida }); }
                  catch (err) { console.error("Erro ao atualizar subtarefa:", err); }
                }}
              />
              <span className={`tc-sub-texto${sub.concluida ? " tc-sub-concluida" : ""}`}>
                {sub.titulo}
              </span>
              <button className="tc-btn-excluir-sub" onClick={() => excluirSubtarefa(sub.id, setSubtarefas)}>✕</button>
            </div>
          ))}
          <div className="tc-add-sub">
            <input
              className="tc-input-sub"
              type="text"
              placeholder="Nova subtarefa..."
              value={novaSubtarefa}
              onChange={(e) => setNovaSubtarefa(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdicionarSubtarefa()}
            />
            <button className="tc-btn-add-sub" onClick={handleAdicionarSubtarefa}>+</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarefaCard;