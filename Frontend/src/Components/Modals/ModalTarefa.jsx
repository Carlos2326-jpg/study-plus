import React, { useState, useEffect } from "react";
import "../../Assets/Styles/Components/ModalTarefa.css";
import { tarefaService, subtarefaService } from "../../Services/tarefaService";
import { disciplinaService } from "../../Services/disciplinaService";
import { estudoService } from "../../Services/estudoService";

export default function ModalTarefa({ isOpen, onClose, tipo = "tarefa", onSalvarSucesso }) {
  const isEstudo = tipo === "estudo";
  
  const [titulo, setTitulo] = useState("");
  const [dataLimite, setDataLimite] = useState("");
  const [horario, setHorario] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [descricao, setDescricao] = useState("");
  
  const [disciplinas, setDisciplinas] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [mostrarAddDisciplina, setMostrarAddDisciplina] = useState(false);
  const [novaDisciplina, setNovaDisciplina] = useState("");
  
  const [subtarefas, setSubtarefas] = useState([]);
  const [novaSubtarefa, setNovaSubtarefa] = useState("");
  
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregarDisciplinas = async () => {
    try {
      const data = await disciplinaService.listar();
      setDisciplinas(data);
    } catch (error) {
      console.error("Erro ao carregar disciplinas:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregarDisciplinas();
    } else {
      setTitulo(""); setDataLimite(""); setHorario(""); setHorarioFim(""); setPrioridade("media"); setDescricao(""); setErro("");
      setSubtarefas([]); setNovaSubtarefa(""); setCategoriaSelecionada("");
      setMostrarAddDisciplina(false); setNovaDisciplina("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tituloModal = isEstudo ? "Novo estudo" : "Nova Tarefa";
  const botaoSalvar = isEstudo ? "Salvar estudo" : "Salvar Tarefa";

  const handleAddSubtarefa = () => {
    if (!novaSubtarefa.trim()) return;
    setSubtarefas([...subtarefas, { id: Date.now(), titulo: novaSubtarefa.trim() }]);
    setNovaSubtarefa("");
  };

  const handleRemoverSubtarefa = (id) => {
    setSubtarefas(subtarefas.filter(sub => sub.id !== id));
  };

  const handleCriarDisciplina = async () => {
    if (!novaDisciplina.trim()) return setErro("Digite o nome da disciplina.");
    try {
      setSalvando(true);
      const nova = await disciplinaService.criar(novaDisciplina.trim(), "");
      await carregarDisciplinas();
      setCategoriaSelecionada(nova.id);
      setMostrarAddDisciplina(false);
      setNovaDisciplina("");
      setErro("");
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao criar disciplina.");
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro("");

    if (!titulo.trim()) return setErro(`O título é obrigatório.`);
    if (!dataLimite) return setErro("A data é obrigatória.");
    if (!categoriaSelecionada) return setErro("Selecione uma disciplina.");

    try {
      setSalvando(true);

      if (isEstudo) {
        // ==========================================
        // LÓGICA PARA ESTUDO (Cria Tarefa + Cronograma)
        // ==========================================
        if (!horario || !horarioFim) {
          setSalvando(false);
          return setErro("Para estudos, preencha o horário de início e fim.");
        }

        // 1. Cria a Tarefa
        const tarefaCriada = await tarefaService.criar({
          titulo: titulo.trim(),
          prazo: dataLimite,
          prioridade: prioridade,
          descricao: descricao.trim(),
          disciplina_id: Number(categoriaSelecionada),
          status: "pendente"
        });

        // BLINDAGEM: Pega o ID independente de como o Axios retornar
        let idDaTarefa = null;
        if (tarefaCriada && tarefaCriada.id) idDaTarefa = tarefaCriada.id;
        else if (tarefaCriada && tarefaCriada.data && tarefaCriada.data.id) idDaTarefa = tarefaCriada.data.id;
        
        if (!idDaTarefa) {
          throw new Error("O servidor não retornou o ID da tarefa criada.");
        }

        // 2. Salva as subtarefas vinculadas a essa tarefa
        if (subtarefas.length > 0) {
          for (const sub of subtarefas) {
            await subtarefaService.criar(idDaTarefa, sub.titulo);
          }
        }

        // 3. Cria o Cronograma (para aparecer na agenda)
        await estudoService.criarCronograma({
          disciplina: disciplinas.find(d => d.id === Number(categoriaSelecionada))?.nome,
          tarefa_id: idDaTarefa, // Vincula o cronograma à tarefa criada
          data_inicio: dataLimite,
          data_fim: dataLimite,
          horario_inicio: horario,
          horario_fim: horarioFim,
          recorrencia: "nenhuma"
        });

      } else {
        // ==========================================
        // LÓGICA PARA TAREFA PADRÃO
        // ==========================================
        const prazoFormatado = horario ? `${dataLimite}T${horario}:00` : dataLimite;
        
        const tarefaCriada = await tarefaService.criar({
          titulo: titulo.trim(),
          prazo: prazoFormatado,
          prioridade: prioridade,
          descricao: descricao.trim(),
          disciplina_id: Number(categoriaSelecionada),
          status: "pendente"
        });

        let idDaTarefa = null;
        if (tarefaCriada && tarefaCriada.id) idDaTarefa = tarefaCriada.id;
        else if (tarefaCriada && tarefaCriada.data && tarefaCriada.data.id) idDaTarefa = tarefaCriada.data.id;

        if (subtarefas.length > 0 && idDaTarefa) {
          for (const sub of subtarefas) {
            await subtarefaService.criar(idDaTarefa, sub.titulo);
          }
        }
      }

      if (onSalvarSucesso) onSalvarSucesso();
      onClose(); 
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setErro(error.response?.data?.message || error.message || "Erro ao salvar no servidor.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-tarefa-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-handle mobile-only"></div>

        <div className="modal-header">
          <h2>{tituloModal}</h2>
          <button className="btn-fechar" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSalvar}>
          <div className="modal-body-scroll">
            
            {erro && <div className="error-message" style={{ marginBottom: "1rem" }}>{erro}</div>}

            <div className="form-row-titulo">
              <div className="input-group" style={{ flex: 1 }}>
                <label>Título {isEstudo ? "do estudo" : "da Tarefa"} *</label>
                <input 
                  type="text" 
                  className="input-modal" 
                  placeholder={isEstudo ? "Escreva o nome do estudo..." : "Escreva o nome da tarefa..."}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>
              
              <button 
                type="button" 
                className="btn-nova-disciplina" 
                onClick={() => setMostrarAddDisciplina(!mostrarAddDisciplina)}
                style={{ marginTop: "1.5rem" }}
              >
                {mostrarAddDisciplina ? "Cancelar" : "Nova Disciplina +"}
              </button>
            </div>

            {mostrarAddDisciplina && (
              <div className="input-group" style={{ padding: "1rem", background: "var(--cinza-50)", borderRadius: "var(--raio)", border: "1px solid var(--cinza-200)" }}>
                <label>Criar nova disciplina</label>
                <div className="subtarefa-add-row">
                  <input 
                    type="text" 
                    className="input-modal" 
                    placeholder="Nome da disciplina..." 
                    value={novaDisciplina}
                    onChange={(e) => setNovaDisciplina(e.target.value)}
                  />
                  <button type="button" className="btn-add-sub" onClick={handleCriarDisciplina} disabled={salvando}>✓</button>
                </div>
              </div>
            )}

            <div className="form-row-2col">
              <div className="input-group">
                <label>Data {isEstudo ? "do Estudo" : "Limite"} *</label>
                <div className="input-with-icon">
                  <span className="icon">📅</span>
                  <input type="date" className="input-modal" value={dataLimite} onChange={(e) => setDataLimite(e.target.value)} />
                </div>
              </div>
              <div className="input-group">
                <label>{isEstudo ? "Início" : "Horário"}</label>
                <div className="input-with-icon">
                  <span className="icon">🕐</span>
                  <input type="time" className="input-modal" value={horario} onChange={(e) => setHorario(e.target.value)} />
                </div>
              </div>
            </div>

            {isEstudo && (
              <div className="input-group">
                <label>Fim do Estudo *</label>
                <div className="input-with-icon">
                  <span className="icon">🕐</span>
                  <input type="time" className="input-modal" value={horarioFim} onChange={(e) => setHorarioFim(e.target.value)} />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Prioridade</label>
              <div className="prioridade-botoes">
                <button type="button" className={`btn-prioridade ${prioridade === "baixa" ? "active baixa" : ""}`} onClick={() => setPrioridade("baixa")}><span className="dot"></span> Baixa</button>
                <button type="button" className={`btn-prioridade ${prioridade === "media" ? "active media" : ""}`} onClick={() => setPrioridade("media")}><span className="dot"></span> Média</button>
                <button type="button" className={`btn-prioridade ${prioridade === "alta" ? "active alta" : ""}`} onClick={() => setPrioridade("alta")}><span className="dot"></span> Alta</button>
              </div>
            </div>

            <div className="input-group">
              <label>Disciplina *</label>
              <div className="input-with-icon">
                <span className="icon">📁</span>
                <select className="input-modal select-categoria" value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)}>
                  <option value="">Selecione uma disciplina...</option>
                  {disciplinas.map(d => (
                    <option key={d.id} value={d.id}>{d.nome}</option>
                  ))}
                </select>
                <span className="icon-chevron">v</span>
              </div>
            </div>

            <div className="input-group">
              <label>Subtarefas</label>
              <div className="subtarefa-add-row">
                <input 
                  type="text" 
                  className="input-modal input-sub" 
                  placeholder="Adicionar subtarefa..." 
                  value={novaSubtarefa}
                  onChange={(e) => setNovaSubtarefa(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtarefa())}
                />
                <button type="button" className="btn-add-sub" onClick={handleAddSubtarefa}>+</button>
              </div>
              {subtarefas.length > 0 && (
                <div className="subtarefas-lista">
                  {subtarefas.map(sub => (
                    <div key={sub.id} className="subtarefa-item">
                      <span>• {sub.titulo}</span>
                      <button type="button" onClick={() => handleRemoverSubtarefa(sub.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Notas / Descrição</label>
              <textarea className="input-modal textarea" placeholder="Escreva detalhes opcionais..." rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)}></textarea>
            </div>
          </div>

          <div className="modal-footer-tarefa">
            <button type="button" className="btn-cancelar-tarefa" onClick={onClose} disabled={salvando}>Cancelar</button>
            <button type="submit" className="btn-salvar-tarefa" disabled={salvando}>{salvando ? "Salvando..." : botaoSalvar}</button>
          </div>
        </form>
      </div>
    </div>
  );
}