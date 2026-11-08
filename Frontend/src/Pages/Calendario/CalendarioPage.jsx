import { useState, useEffect } from "react";
import Calendario from "../../Components/Calendario/Calendario.jsx";
import { cronogramaService, tarefaService } from "../../Services/tarefaService.js";
import api from "../../Services/api.js";
import "../../Assets/Styles/Pages/CalendarioPage.css";

const CalendarioPage = () => {
  const [tarefas, setTarefas] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [cronogramaEditando, setCronogramaEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [filtros, setFiltros] = useState({ disciplina_id: "", recorrencia: "", status: "", data_inicio: "", data_fim: "", prioridade: "" });
  const [form, setForm] = useState({ disciplina_id: "", tarefa_id: "", data: "", hora_inicio: "", hora_fim: "", recorrencia: "nenhuma" });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [tarefasData, cronogramasData, disciplinasData] = await Promise.all([
          tarefaService.listar({ usuario_id: 1 }),
          cronogramaService.listar(1),
          api.get("/disciplinas").then((r) => r.data),
        ]);
        setTarefas(tarefasData);
        setCronogramas(cronogramasData);
        setDisciplinas(disciplinasData);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, []);

  const handleFiltro = (e) => { const { name, value } = e.target; setFiltros((prev) => ({ ...prev, [name]: value })); };
  const handleFormChange = (e) => { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); };

  const resetForm = () => setForm({ disciplina_id: "", tarefa_id: "", data: "", hora_inicio: "", hora_fim: "", recorrencia: "nenhuma" });

  const handleSalvar = async () => {
    if (!form.data) return alert("Data é obrigatória!");
    try {
      if (cronogramaEditando) {
        await cronogramaService.atualizar(cronogramaEditando.id, form);
        setCronogramas((prev) => prev.map((c) => (c.id === cronogramaEditando.id ? { ...c, ...form } : c)));
      } else {
        const novo = await cronogramaService.criar({ ...form, usuario_id: 1 });
        setCronogramas((prev) => [...prev, novo]);
      }
    } catch (err) {
      console.error("Erro ao salvar cronograma:", err);
      alert("Erro ao salvar cronograma. Verifique se o servidor está rodando.");
    }
    setModalAberto(false);
    setCronogramaEditando(null);
    resetForm();
  };

  const handleEditar = (cronograma) => {
    setCronogramaEditando(cronograma);
    setForm({ disciplina_id: cronograma.disciplina_id, tarefa_id: cronograma.tarefa_id, data: cronograma.data, hora_inicio: cronograma.hora_inicio, hora_fim: cronograma.hora_fim, recorrencia: cronograma.recorrencia });
    setModalAberto(true);
  };

  const handleExcluir = async (id) => {
    try {
      await cronogramaService.excluir(id);
      setCronogramas((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Erro ao excluir cronograma:", err);
      alert("Erro ao excluir cronograma.");
    }
  };

  const cronogramasFiltrados = cronogramas.filter((c) => {
    if (filtros.disciplina_id && c.disciplina_id !== Number(filtros.disciplina_id)) return false;
    if (filtros.recorrencia && c.recorrencia !== filtros.recorrencia) return false;
    if (filtros.data_inicio && (c.data?.split("T")[0] ?? "") < filtros.data_inicio) return false;
    if (filtros.data_fim   && (c.data?.split("T")[0] ?? "") > filtros.data_fim)   return false;
    if (filtros.status || filtros.prioridade) {
      const tarefa = tarefas.find((t) => t.id === Number(c.tarefa_id));
      if (filtros.status    && tarefa?.status    !== filtros.status)    return false;
      if (filtros.prioridade && tarefa?.prioridade !== filtros.prioridade) return false;
    }
    return true;
  });

  const tarefasFiltradas = tarefas.filter((t) => {
    if (filtros.disciplina_id && t.disciplina_id !== Number(filtros.disciplina_id)) return false;
    if (filtros.status     && t.status     !== filtros.status)     return false;
    if (filtros.prioridade && t.prioridade !== filtros.prioridade) return false;
    return true;
  });

  if (carregando)
    return <div className="loading-screen">Carregando calendário... 🌱</div>;

  return (
    <div className="cal-wrapper">
      <div className="cal-container">

        <div className="cal-filtros">
          <div className="cal-filtro-linha">
            <select className="cal-input" name="disciplina_id" value={filtros.disciplina_id} onChange={handleFiltro}>
              <option value="">Disciplina</option>
              {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
            <select className="cal-input" name="recorrencia" value={filtros.recorrencia} onChange={handleFiltro}>
              <option value="">Recorrência</option>
              <option value="nenhuma">Nenhuma</option>
              <option value="diaria">Diária</option>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
            </select>
            <select className="cal-input" name="status" value={filtros.status} onChange={handleFiltro}>
              <option value="">Status</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>
          <div className="cal-filtro-linha">
            <input className="cal-input" type="date" name="data_inicio" value={filtros.data_inicio} onChange={handleFiltro} />
            <input className="cal-input" type="date" name="data_fim" value={filtros.data_fim} onChange={handleFiltro} />
            <select className="cal-input" name="prioridade" value={filtros.prioridade} onChange={handleFiltro}>
              <option value="">Prioridade</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        <div className="cal-conteudo">
          <div className="cal-calendario-wrapper">
            <Calendario tarefas={tarefasFiltradas} cronogramas={cronogramasFiltrados} disciplinas={disciplinas} />
          </div>

          <div className="cal-lista">
            <div className="cal-lista-header">
              <span className="cal-lista-titulo">Cronogramas</span>
              <button className="cal-btn-criar" onClick={() => { setCronogramaEditando(null); setModalAberto(true); }}>+ Criar</button>
            </div>
            <div className="cal-lista-itens">
              {cronogramasFiltrados.length === 0 ? (
                <p className="cal-vazio">Nenhum cronograma.</p>
              ) : (
                cronogramasFiltrados.map((c) => {
                  const tarefa = tarefas.find((t) => t.id === Number(c.tarefa_id));
                  const disciplina = disciplinas.find((d) => d.id === Number(c.disciplina_id));
                  return (
                    <div key={c.id} className="cal-crono-card">
                      <div className="cal-crono-info">
                        <span className="cal-crono-nome">{tarefa ? tarefa.titulo : "Sem tarefa"}</span>
                        <span className="cal-crono-detalhe">{disciplina?.nome} · {c.recorrencia}</span>
                        <span className="cal-crono-detalhe">{c.hora_inicio} – {c.hora_fim}</span>
                      </div>
                      <div className="cal-crono-botoes">
                        <button className="cal-btn-deletar" onClick={() => handleExcluir(c.id)}>Deletar</button>
                        <button className="cal-btn-editar" onClick={() => handleEditar(c)}>Editar</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {modalAberto && (
        <div className="cal-overlay">
          <div className="cal-modal">
            <div className="cal-modal-header">
              <span>{cronogramaEditando ? "Editar Cronograma" : "Novo Cronograma"}</span>
            </div>
            <div className="cal-modal-form">
              <select className="cal-input-modal" name="disciplina_id" value={form.disciplina_id} onChange={handleFormChange}>
                <option value="">Disciplina</option>
                {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </select>
              <select className="cal-input-modal" name="tarefa_id" value={form.tarefa_id} onChange={handleFormChange}>
                <option value="">Tarefa</option>
                {tarefas.map((t) => <option key={t.id} value={t.id}>{t.titulo}</option>)}
              </select>
              <input className="cal-input-modal" type="date" name="data" value={form.data} onChange={handleFormChange} />
              <div className="cal-modal-linha">
                <input className="cal-input-modal" type="time" name="hora_inicio" value={form.hora_inicio} onChange={handleFormChange} />
                <input className="cal-input-modal" type="time" name="hora_fim" value={form.hora_fim} onChange={handleFormChange} />
              </div>
              <select className="cal-input-modal" name="recorrencia" value={form.recorrencia} onChange={handleFormChange}>
                <option value="nenhuma">Sem recorrência</option>
                <option value="diaria">Diária</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
              </select>
              <div className="cal-modal-botoes">
                <button className="cal-btn-salvar" onClick={handleSalvar}>{cronogramaEditando ? "Salvar" : "Criar"}</button>
                <button className="cal-btn-cancelar" onClick={() => { setModalAberto(false); setCronogramaEditando(null); }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioPage;