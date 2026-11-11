import React, { useState, useEffect } from "react";
import "../../Assets/Styles/Components/ModalTarefa.css";
import { tarefaService, subtarefaService } from "../../Services/tarefaService";
import { disciplinaService } from "../../Services/disciplinaService";
import { estudoService } from "../../Services/estudoService";

const extrairLista = (resposta) => {
  if (Array.isArray(resposta)) return resposta;
  if (resposta && Array.isArray(resposta.data)) return resposta.data;
  if (resposta && resposta.data && Array.isArray(resposta.data.data)) return resposta.data.data;
  return [];
};

const extrairId = (obj) => (obj && obj.id) || (obj && obj.data && obj.data.id) || null;

// Função para pegar a data de hoje no formato YYYY-MM-DD
const getHoje = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
};

export default function ModalTarefa({ isOpen, onClose, tipo = "tarefa", onSalvarSucesso, tarefa = null }) {
  const editando = !!tarefa;
  const isEstudo = tipo === "estudo" && !editando;

  const [titulo, setTitulo] = useState("");
  const [dataLimite, setDataLimite] = useState("");
  const [horario, setHorario] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [descricao, setDescricao] = useState("");
  
  // NOVOS CAMPOS: Recorrência
  const [recorrencia, setRecorrencia] = useState("nenhuma");
  const [dataFim, setDataFim] = useState("");

  const [disciplinas, setDisciplinas] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [mostrarAddDisciplina, setMostrarAddDisciplina] = useState(false);
  const [novaDisciplina, setNovaDisciplina] = useState("");

  const [subtarefas, setSubtarefas] = useState([]);
  const [subsOriginais, setSubsOriginais] = useState([]);
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
      
      // Limpa campos de recorrência ao abrir
      setRecorrencia("nenhuma");
      setDataFim("");

      if (tarefa) {
        const prazo = tarefa.prazo || "";
        setTitulo(tarefa.titulo || "");
        setDataLimite(prazo.slice(0, 10));
        setHorario(prazo.length > 10 ? prazo.slice(11, 16) : "");
        setPrioridade(tarefa.prioridade || "media");
        setDescricao(tarefa.descricao || "");
        setCategoriaSelecionada(tarefa.disciplina_id ? String(tarefa.disciplina_id) : "");

        subtarefaService.listarPorTarefa(tarefa.id)
          .then((resp) => {
            const lista = extrairLista(resp);
            setSubtarefas(lista);
            setSubsOriginais(lista);
          })
          .catch((e) => console.error("Erro ao carregar subtarefas:", e));
      }
    } else {
      setTitulo(""); setDataLimite(""); setHorario(""); setHorarioFim(""); setPrioridade("media"); setDescricao(""); setErro("");
      setSubtarefas([]); setSubsOriginais([]); setNovaSubtarefa(""); setCategoriaSelecionada("");
      setMostrarAddDisciplina(false); setNovaDisciplina("");
      setRecorrencia("nenhuma"); setDataFim("");
    }
  }, [isOpen, tarefa]);

  if (!isOpen) return null;

  const tituloModal = editando ? "Editar Tarefa" : isEstudo ? "Novo estudo" : "Nova Tarefa";
  const botaoSalvar = editando ? "Salvar alterações" : isEstudo ? "Salvar estudo" : "Salvar Tarefa";

  const handleAddSubtarefa = () => {
    if (!novaSubtarefa.trim()) return;
    setSubtarefas([...subtarefas, { id: Date.now(), titulo: novaSubtarefa.trim(), nova: true }]);
    setNovaSubtarefa("");
  };

  const handleEditarTituloSubtarefa = (id, novoTitulo) => {
    setSubtarefas(subtarefas.map((s) => (s.id === id ? { ...s, titulo: novoTitulo } : s)));
  };

  const handleRemoverSubtarefa = (id) => {
    setSubtarefas(subtarefas.filter((sub) => sub.id !== id));
  };

  const handleCriarDisciplina = async () => {
    if (!novaDisciplina.trim()) return setErro("Digite o nome da disciplina.");
    try {
      setSalvando(true);
      const nova = await disciplinaService.criar(novaDisciplina.trim(), "");
      await carregarDisciplinas();
      setCategoriaSelecionada(String(nova.id));
      setMostrarAddDisciplina(false);
      setNovaDisciplina("");
      setErro("");
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao criar disciplina.");
    } finally {
      setSalvando(false);
    }
  };

  const sincronizarSubtarefas = async (tarefaId) => {
    const idsAtuais = subtarefas.filter((s) => !s.nova).map((s) => s.id);

    for (const orig of subsOriginais) {
      if (!idsAtuais.includes(orig.id)) {
        await subtarefaService.excluir(orig.id);
      }
    }
    for (const sub of subtarefas) {
      if (sub.nova) {
        await subtarefaService.criar(tarefaId, sub.titulo);
      } else {
        const orig = subsOriginais.find((o) => o.id === sub.id);
        if (orig && orig.titulo !== sub.titulo) {
          const concluida = orig.concluida === 1 || orig.concluida === true || orig.concluida === "1";
          await subtarefaService.atualizar(sub.id, { titulo: sub.titulo.trim(), concluida });
        }
      }
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro("");

    const hoje = getHoje();

    // --- VALIDAÇÕES ---
    if (!titulo.trim()) return setErro("O título é obrigatório.");
    if (!dataLimite) return setErro("A data é obrigatória.");
    if (!categoriaSelecionada) return setErro("Selecione uma disciplina.");
    
    // Validação de data passada (só para criação de novos estudos/tarefas)
    if (!editando && dataLimite < hoje) {
      return setErro("Não é possível agendar para uma data que já passou.");
    }

    // Validação de recorrência
    if (isEstudo && recorrencia !== "nenhuma") {
      if (!dataFim) return setErro("Informe a data de fim da recorrência.");
      if (dataFim < dataLimite) return setErro("A data de fim deve ser igual ou posterior à data de início.");
      if (dataFim < hoje) return setErro("A data de fim não pode estar no passado.");
    }

    try {
      setSalvando(true);

      if (editando) {
        // ---------- EDIÇÃO ----------
        const prazoFormatado = horario ? `${dataLimite}T${horario}:00` : dataLimite;

        await tarefaService.atualizar(tarefa.id, {
          titulo: titulo.trim(),
          prazo: prazoFormatado,
          prioridade,
          descricao: descricao.trim(),
          disciplina_id: Number(categoriaSelecionada),
          status: tarefa.status,
        });

        await sincronizarSubtarefas(tarefa.id);

      } else if (isEstudo) {
        // ---------- NOVO ESTUDO (Tarefa + Cronograma com Recorrência) ----------
        if (!horario || !horarioFim) {
          setSalvando(false);
          return setErro("Para estudos, preencha o horário de início e fim.");
        }

        const tarefaCriada = await tarefaService.criar({
          titulo: titulo.trim(),
          prazo: dataLimite,
          prioridade,
          descricao: descricao.trim(),
          disciplina_id: Number(categoriaSelecionada),
          status: "pendente",
        });
        const idDaTarefa = extrairId(tarefaCriada);
        if (!idDaTarefa) throw new Error("O servidor não retornou o ID da tarefa criada.");

        for (const sub of subtarefas) {
          await subtarefaService.criar(idDaTarefa, sub.titulo);
        }

        // Envia recorrência para o Back-end
        const dadosCronograma = {
          disciplina: disciplinas.find((d) => d.id === Number(categoriaSelecionada))?.nome,
          tarefa_id: idDaTarefa,
          data_inicio: dataLimite,
          data_fim: recorrencia === "nenhuma" ? dataLimite : dataFim,
          horario_inicio: horario,
          horario_fim: horarioFim,
          recorrencia: recorrencia,
        };

        await estudoService.criarCronograma(dadosCronograma);

      } else {
        // ---------- NOVA TAREFA ----------
        const prazoFormatado = horario ? `${dataLimite}T${horario}:00` : dataLimite;

        const tarefaCriada = await tarefaService.criar({
          titulo: titulo.trim(),
          prazo: prazoFormatado,
          prioridade,
          descricao: descricao.trim(),
          disciplina_id: Number(categoriaSelecionada),
          status: "pendente",
        });
        const idDaTarefa = extrairId(tarefaCriada);

        if (idDaTarefa) {
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
                  <input 
                    type="date" 
                    className="input-modal" 
                    value={dataLimite} 
                    onChange={(e) => setDataLimite(e.target.value)}
                    // BLOQUEIA DATAS PASSADAS NO PRÓPRIO NAVEGADOR
                    min={getHoje()} 
                  />
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
              <>
                <div className="input-group">
                  <label>Fim *</label>
                  <div className="input-with-icon">
                    <span className="icon">🕐</span>
                    <input type="time" className="input-modal" value={horarioFim} onChange={(e) => setHorarioFim(e.target.value)} />
                  </div>
                </div>

                {/* NOVO: Campos de Recorrência */}
                <div className="form-row-2col">
                  <div className="input-group">
                    <label>Recorrência</label>
                    <select 
                      className="input-modal" 
                      value={recorrencia} 
                      onChange={(e) => {
                        setRecorrencia(e.target.value);
                        if (e.target.value === "nenhuma") setDataFim("");
                      }}
                    >
                      <option value="nenhuma">Nenhuma</option>
                      <option value="diaria">Diária</option>
                      <option value="semanal">Semanal</option>
                    </select>
                  </div>
                  
                  {recorrencia !== "nenhuma" && (
                    <div className="input-group">
                      <label>Repetir até *</label>
                      <div className="input-with-icon">
                        <span className="icon">📅</span>
                        <input 
                          type="date" 
                          className="input-modal" 
                          value={dataFim} 
                          onChange={(e) => setDataFim(e.target.value)}
                          min={dataLimite || getHoje()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="form-row-2col">
              <div className="input-group">
                <label>Disciplina *</label>
                <select className="input-modal select-categoria" value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)}>
                  <option value="">Selecione uma disciplina...</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={d.id}>{d.nome}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Prioridade</label>
                <select className="input-modal select-categoria" value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
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
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSubtarefa())}
                />
                <button type="button" className="btn-add-sub" onClick={handleAddSubtarefa}>+</button>
              </div>
              {subtarefas.length > 0 && (
                <div className="subtarefas-lista">
                  {subtarefas.map((sub) => (
                    <div key={sub.id} className="subtarefa-item">
                      <input
                        type="text"
                        className="input-modal input-sub"
                        value={sub.titulo}
                        onChange={(e) => handleEditarTituloSubtarefa(sub.id, e.target.value)}
                      />
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