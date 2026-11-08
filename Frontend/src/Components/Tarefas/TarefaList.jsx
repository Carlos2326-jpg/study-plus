import { useState } from "react";
import TarefaCard from "./TarefaCard.jsx";
import { filtrarTarefas } from "../../Controllers/tarefaController.js";
import "../../Assets/Styles/Tarefas.css";

const TarefaList = ({ tarefas = [], disciplinas = [], subtarefasState = [], setSubtarefas, setTarefas, onEditar, onNovaTarefa }) => {
  const [filtros, setFiltros] = useState({ titulo: "", status: "", data_inicio: "", data_fim: "", prioridade: "" });

  const handleFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const tarefasFiltradas = filtrarTarefas(tarefas, filtros);

  return (
    <div className="tl-wrapper">
      <div className="tl-container">

        <div className="tl-header">
          <span className="tl-titulo">Lista de Tarefas</span>
          <button className="tl-btn-criar" onClick={onNovaTarefa}>+ Criar</button>
        </div>

        <div className="tl-filtros">
          <div className="tl-filtro-linha">
            <input className="tl-input" type="text" name="titulo" placeholder="Buscar tarefa..." value={filtros.titulo} onChange={handleFiltro} />
            <select className="tl-input" name="status" value={filtros.status} onChange={handleFiltro}>
              <option value="">Status</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>
          <div className="tl-filtro-linha">
            <input className="tl-input" type="date" name="data_inicio" value={filtros.data_inicio} onChange={handleFiltro} />
            <input className="tl-input" type="date" name="data_fim" value={filtros.data_fim} onChange={handleFiltro} />
            <select className="tl-input" name="prioridade" value={filtros.prioridade} onChange={handleFiltro}>
              <option value="">Prioridade</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        {tarefasFiltradas.length === 0 ? (
          <div className="tl-vazio"><p>Nenhuma tarefa encontrada.</p></div>
        ) : (
          <div className="tl-lista">
            {tarefasFiltradas.map((tarefa) => (
              <TarefaCard key={tarefa.id} tarefa={tarefa} disciplinas={disciplinas} subtarefasState={subtarefasState} setSubtarefas={setSubtarefas} setTarefas={setTarefas} onEditar={onEditar} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default TarefaList;