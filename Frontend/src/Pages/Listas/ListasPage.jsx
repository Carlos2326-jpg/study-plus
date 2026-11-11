import React, { useState, useEffect, useCallback } from "react";
import "../../Assets/Styles/Pages/ListasPage.css";
import { tarefaService, subtarefaService } from "../../Services/tarefaService";
import { disciplinaService } from "../../Services/disciplinaService";
import { estudoService } from "../../Services/estudoService";
import { formatarData, formatarHorario } from "../../Utils/formatters";

const CORES_DISCIPLINAS = [
  "var(--purple-dark)", 
  "var(--grafico-roxo-medio)", 
  "var(--grafico-laranja)", 
  "var(--grafico-vermelho-claro)",
  "#22c55e"
];

export default function ListasPage() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  
  const [tarefaExpandida, setTarefaExpandida] = useState(null);
  const [subtarefas, setSubtarefas] = useState({});
  const [carregandoSubs, setCarregandoSubs] = useState(false);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const [disciplinasData, tarefasData, cronogramasData] = await Promise.all([
        disciplinaService.listar(),
        tarefaService.listar(),
        estudoService.listarCronogramas()
      ]);
      setDisciplinas(disciplinasData);
      setTarefas(tarefasData);
      setCronogramas(cronogramasData.data || cronogramasData);
    } catch (error) {
      console.error("Erro ao carregar listas:", error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // --- Lógica para buscar Subtarefas ---
  const toggleSubtarefas = async (tarefaId) => {
    if (tarefaExpandida === tarefaId) {
      setTarefaExpandida(null);
      return;
    }

    setTarefaExpandida(tarefaId);
    if (subtarefas[tarefaId]) return;

    try {
      setCarregandoSubs(true);
      const resposta = await subtarefaService.listarPorTarefa(tarefaId);
      
      let listaReal = [];
      if (Array.isArray(resposta)) listaReal = resposta;
      else if (resposta && Array.isArray(resposta.data)) listaReal = resposta.data;
      else if (resposta && resposta.data && Array.isArray(resposta.data.data)) listaReal = resposta.data.data;

      setSubtarefas(prev => ({ ...prev, [tarefaId]: listaReal }));
    } catch (error) {
      console.error("Erro ao buscar subtarefas:", error);
    } finally {
      setCarregandoSubs(false);
    }
  };

  // --- FUNÇÃO QUE ESTAVA FALTANDO ---
  const handleToggleSubtarefa = async (subtarefa, tarefaId) => {
    try {
      const statusAtual = subtarefa.concluida === 1 || subtarefa.concluida === true || subtarefa.concluida === '1';
      const novoStatus = !statusAtual;
      
      await subtarefaService.atualizar(subtarefa.id, { 
        titulo: subtarefa.titulo, 
        concluida: novoStatus 
      });

      setSubtarefas(prev => ({
        ...prev,
        [tarefaId]: prev[tarefaId].map(sub => 
          sub.id === subtarefa.id ? { ...sub, concluida: novoStatus } : sub
        )
      }));

      carregarDados();
    } catch (error) {
      console.error("Erro ao atualizar subtarefa:", error);
      alert("Erro ao atualizar a subtarefa.");
    }
  };

  // --- Ações Reais no Banco de Dados ---
  const handleToggleTarefa = async (tarefa) => {
    try {
      const statusAtual = tarefa.status === "concluida";
      const novoStatus = statusAtual ? "pendente" : "concluida";
      
      await tarefaService.atualizar(tarefa.id, { ...tarefa, status: novoStatus });
      
      if (novoStatus === "concluida") {
        const subsDaTarefa = subtarefas[tarefa.id];
        if (subsDaTarefa && subsDaTarefa.length > 0) {
          for (const sub of subsDaTarefa) {
            await subtarefaService.atualizar(sub.id, { titulo: sub.titulo, concluida: true });
          }
        }
      }

      carregarDados(); 
      setSubtarefas(prev => {
        const novoCache = { ...prev };
        delete novoCache[tarefa.id];
        return novoCache;
      });

    } catch (error) {
      alert("Erro ao atualizar a tarefa.");
    }
  };

  const handleExcluirTarefa = async (id, titulo) => {
    if (!window.confirm(`Excluir a tarefa "${titulo}"?`)) return;
    try {
      await tarefaService.excluir(id);
      carregarDados(); 
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao excluir a tarefa.");
    }
  };

  const handleExcluirDisciplina = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir a disciplina "${nome}"?\n\nAtenção: Todas as tarefas vinculadas a ela também serão excluídas.`)) return;
    
    try {
      const tarefasParaExcluir = tarefas.filter(t => t.disciplina_id === id);
      for (const tarefa of tarefasParaExcluir) {
        await tarefaService.excluir(tarefa.id);
      }
      await disciplinaService.excluir(id);
      carregarDados();
    } catch (error) {
      alert(error.response?.data?.message || "Não é possível excluir a disciplina.");
    }
  };

  const handleEditarDisciplina = async (disciplina) => {
    const novoNome = window.prompt("Editar nome da disciplina:", disciplina.nome);
    if (!novoNome || novoNome.trim() === "" || novoNome === disciplina.nome) return;
    try {
      await disciplinaService.atualizar(disciplina.id, novoNome.trim(), disciplina.descricao || "");
      carregarDados();
    } catch (error) {
      alert("Erro ao editar disciplina.");
    }
  };

  if (carregando) return <div className="loading-screen">Carregando listas...</div>;

  const tarefasFiltradas = tarefas.filter(t => 
    t.titulo.toLowerCase().includes(busca.toLowerCase())
  );
  
  const cronogramasFiltrados = cronogramas.filter(c => 
    (c.disciplina || "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="listas-container">
      <div className="listas-header">
        <h1>Listas</h1>
      </div>

      <div className="listas-busca-wrapper">
        <span className="icone-busca">🔍</span>
        <input 
          type="text" 
          className="listas-input-busca" 
          placeholder="Buscar tarefa ou estudo..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="listas-grid">
        {disciplinas.length === 0 ? (
          <p style={{ color: "var(--texto-secundario)" }}>Nenhuma disciplina cadastrada.</p>
        ) : (
          disciplinas.map((disc, index) => {
            const tarefasDaDisciplina = tarefasFiltradas.filter(t => t.disciplina_id === disc.id);
            const cronogramasDaDisciplina = cronogramasFiltrados.filter(c => c.disciplina === disc.nome);
            const corBolinha = CORES_DISCIPLINAS[index % CORES_DISCIPLINAS.length];

            return (
              <div key={disc.id} className="grupo-lista">
                <div className="grupo-header">
                  <div className="grupo-titulo">
                    <span className="bolinha-cor" style={{ background: corBolinha }}></span>
                    <h2>{disc.nome}</h2>
                  </div>
                  <div className="grupo-info" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span className="qtd-tarefas">{tarefasDaDisciplina.length} tarefas</span>
                    <button onClick={() => handleEditarDisciplina(disc)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--purple-main)", fontSize: "0.8rem" }}>Editar</button>
                    <button onClick={() => handleExcluirDisciplina(disc.id, disc.nome)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--cor-alta-texto)", fontSize: "0.8rem" }}>Excluir</button>
                  </div>
                </div>

                {/* Cronogramas / Estudos Agendados */}
                {cronogramasDaDisciplina.length > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "0.85rem", color: "var(--texto-secundario)", marginBottom: "0.5rem", fontWeight: 600 }}>📅 Estudos Agendados</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {cronogramasDaDisciplina.map((crono) => (
                        <div key={crono.id} style={{ 
                          background: "var(--purple-suave)", 
                          padding: "0.75rem 1rem", 
                          borderRadius: "var(--raio)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--purple-dark)" }}>
                              {crono.tarefa_titulo || "Estudo agendado"} 
                            </span>
                            <span style={{ fontSize: "0.8rem", color: "var(--texto-secundario)" }}>
                              {formatarData(crono.data)} • {formatarHorario(crono.hora_inicio)} - {formatarHorario(crono.hora_fim)}
                              {crono.recorrencia !== "nenhuma" && ` • Repete ${crono.recorrencia}`}
                            </span>
                          </div>
                          <span style={{ 
                            fontSize: "0.7rem", 
                            background: "var(--purple-light)", 
                            color: "white", 
                            padding: "0.2rem 0.6rem", 
                            borderRadius: "var(--raio-pill)",
                            fontWeight: 600
                          }}>
                            {crono.recorrencia === "nenhuma" ? "Único" : "Recorrente"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tarefas */}
                <div className="grupo-tarefas">
                  {tarefasDaDisciplina.length === 0 ? (
                    <p style={{ fontSize: "0.85rem", color: "var(--cinza-400)", padding: "0.5rem" }}>Nenhuma tarefa nesta lista.</p>
                  ) : (
                    tarefasDaDisciplina.map((tarefa) => (
                      <div key={tarefa.id} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        
                        <div className="item-tarefa" style={{ position: "relative" }}>
                          <div className="tarefa-checkbox" onClick={() => handleToggleTarefa(tarefa)} style={{ cursor: "pointer" }}>
                            <div className={`quadrado ${tarefa.status === 'concluida' ? "marcado" : ""}`}>
                              {tarefa.status === 'concluida' && <span style={{ color: "white", fontSize: "10px" }}>✓</span>}
                            </div>
                          </div>
                          <div className="tarefa-textos">
                            <span className={`tarefa-titulo ${tarefa.status === 'concluida' ? "riscado" : ""}`}>
                              {tarefa.titulo}
                            </span>
                            <span className="tarefa-prazo">
                              Prazo: {tarefa.prazo ? formatarData(tarefa.prazo) : "Sem prazo"}
                              {" • "}
                              <strong style={{ color: tarefa.status === 'concluida' ? "var(--cor-baixa-texto)" : tarefa.status === 'em_andamento' ? "var(--cor-media-texto)" : "var(--texto-secundario)" }}>
                                {tarefa.status === 'concluida' ? "Concluída" : tarefa.status === 'em_andamento' ? "Em andamento" : "Pendente"}
                              </strong>
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => handleExcluirTarefa(tarefa.id, tarefa.titulo)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--cor-alta-texto)", fontSize: "1rem", marginLeft: "auto", marginRight: "0.5rem", padding: "0.25rem" }}
                            title="Excluir Tarefa"
                          >
                            🗑️
                          </button>

                          <button 
                            onClick={() => toggleSubtarefas(tarefa.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--purple-main)", fontSize: "0.8rem", fontWeight: 600 }}
                          >
                            {tarefaExpandida === tarefa.id ? "Ocultar" : "Ver Subtarefas"}
                          </button>
                        </div>

                        {tarefaExpandida === tarefa.id && (
                          <div style={{ paddingLeft: "2.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", paddingBottom: "0.5rem" }}>
                            {carregandoSubs && !subtarefas[tarefa.id] ? (
                              <span style={{ fontSize: "0.8rem", color: "var(--cinza-400)" }}>Buscando no banco...</span>
                            ) : subtarefas[tarefa.id]?.length === 0 ? (
                              <span style={{ fontSize: "0.8rem", color: "var(--cinza-400)" }}>Nenhuma subtarefa cadastrada.</span>
                            ) : (
                              subtarefas[tarefa.id]?.map(sub => {
                                const isConcluida = sub.concluida === 1 || sub.concluida === true || sub.concluida === '1';
                                return (
                                  <div 
                                    key={sub.id} 
                                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
                                    onClick={() => handleToggleSubtarefa(sub, tarefa.id)}
                                  >
                                    <div className={`quadrado ${isConcluida ? "marcado" : ""}`} style={{ width: "16px", height: "16px", borderRadius: "4px", borderWidth: "1.5px" }}>
                                      {isConcluida && <span style={{ color: "white", fontSize: "10px" }}>✓</span>}
                                    </div>
                                    <span style={{ fontSize: "0.85rem", color: isConcluida ? "var(--cinza-400)" : "var(--texto-secundario)", textDecoration: isConcluida ? "line-through" : "none" }}>
                                      {sub.titulo}
                                    </span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}

                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}