import { useState, useEffect } from "react";

const TarefaForm = ({ tarefaExistente = null, disciplinas = [], onSalvar, onCancelar }) => {
  const [form, setForm] = useState({ titulo: "", disciplina_id: "", descricao: "", prioridade: "media", status: "pendente", prazo: "", recorrente: false });
  const [novaSubtarefa, setNovaSubtarefa] = useState("");
  const [subtarefasForm, setSubtarefasForm] = useState([]);

  useEffect(() => {
    if (tarefaExistente) {
      setForm({
        titulo: tarefaExistente.titulo || "",
        disciplina_id: tarefaExistente.disciplina_id || "",
        descricao: tarefaExistente.descricao || "",
        prioridade: tarefaExistente.prioridade || "media",
        status: tarefaExistente.status || "pendente",
        prazo: tarefaExistente.prazo || "",
        recorrente: tarefaExistente.recorrente || false,
      });
    }
  }, [tarefaExistente]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAdicionarSubtarefa = () => {
    if (!novaSubtarefa.trim()) return;
    setSubtarefasForm((prev) => [...prev, { id: Date.now(), titulo: novaSubtarefa, concluida: false }]);
    setNovaSubtarefa("");
  };

  const handleRemoverSubtarefa = (id) => setSubtarefasForm((prev) => prev.filter((s) => s.id !== id));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) return alert("Título é obrigatório!");
    const dadosFormatados = { ...form, disciplina_id: form.disciplina_id === "" ? null : parseInt(form.disciplina_id, 10) };
    onSalvar(dadosFormatados, subtarefasForm);
  };

  return (
    <div className="tf-overlay">
      <div className="tf-modal">

        <div className="tf-header">
          <span>{tarefaExistente ? "Editar Tarefa" : "Nova Tarefa"}</span>
        </div>

        <form onSubmit={handleSubmit} className="tf-form">

          <div className="tf-linha">
            <input className="tf-input" type="text" name="titulo" placeholder="Título" value={form.titulo} onChange={handleChange} />
            <select className="tf-input" name="disciplina_id" value={form.disciplina_id} onChange={handleChange}>
              <option value="">Disciplina</option>
              {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </div>

          <textarea className="tf-textarea" name="descricao" placeholder="Descrição (opcional)" value={form.descricao} onChange={handleChange} rows={3} />

          <div className="tf-linha">
            <select className="tf-input" name="prioridade" value={form.prioridade} onChange={handleChange}>
              <option value="">Prioridade</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
            <select className="tf-input" name="status" value={form.status} onChange={handleChange}>
              <option value="">Status</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>

          <div className="tf-linha">
            <div className="tf-subtarefas-box">
              <div className="tf-sub-input-row">
                <input className="tf-input" type="text" placeholder="Nova subtarefa..." value={novaSubtarefa} onChange={(e) => setNovaSubtarefa(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdicionarSubtarefa())} />
                <button type="button" className="tf-btn-add-sub" onClick={handleAdicionarSubtarefa}>+</button>
              </div>
              {subtarefasForm.map((s) => (
                <div key={s.id} className="tf-sub-item">
                  <span>• {s.titulo}</span>
                  <button type="button" className="tf-btn-rem-sub" onClick={() => handleRemoverSubtarefa(s.id)}>✕</button>
                </div>
              ))}
            </div>

            <div className="tf-prazo-box">
              <input className="tf-input" type="date" name="prazo" value={form.prazo} onChange={handleChange} />
              <label className="tf-check-label">
                <input type="checkbox" name="recorrente" checked={form.recorrente} onChange={handleChange} />
                Recorrente
              </label>
            </div>
          </div>

          <div className="tf-botoes">
            <button type="submit" className="tf-btn-salvar">{tarefaExistente ? "Salvar" : "Criar"}</button>
            <button type="button" className="tf-btn-cancelar" onClick={onCancelar}>Cancelar</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TarefaForm;