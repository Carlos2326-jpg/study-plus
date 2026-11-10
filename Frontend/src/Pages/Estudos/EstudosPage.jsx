import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../Assets/Styles/Pages/EstudosPage.css";
import ModalTarefa from "../../Components/Modals/ModalTarefa";
import { estudoService } from "../../Services/estudoService";
import { tarefaService, subtarefaService } from "../../Services/tarefaService";
import { notificacaoService } from "../../Services/notificacaoService";
import { formatarData, formatarHorario } from "../../Utils/formatters";
import { useAuth } from "../../Controllers/authController";

export default function EstudosPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [cronogramas, setCronogramas] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroAtivo, setFiltroAtivo] = useState("todas");
  const [totalNotificacoes, setTotalNotificacoes] = useState(0);

  // Estados para as Subtarefas
  const [tarefaExpandida, setTarefaExpandida] = useState(null);
  const [subtarefasCache, setSubtarefasCache] = useState({});
  const [carregandoSubs, setCarregandoSubs] = useState(false);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const [cronogramasRes, tarefasRes] = await Promise.all([
        estudoService.listarCronogramas(),
        tarefaService.listar()
      ]);
      
      setCronogramas(cronogramasRes.data || cronogramasRes);
      setTarefas(tarefasRes.data || tarefasRes);
    } catch (error) {
      console.error("Erro ao carregar estudos:", error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    
    // Busca as notificações para mostrar a bolinha no sino
    notificacaoService.listar()
      .then(res => setTotalNotificacoes(res.total || 0))
      .catch(() => {});
  }, [carregarDados]);

  // Lógica de Filtro
  const cronogramasFiltrados = cronogramas.filter(c => {
    if (filtroAtivo === "todas") return true;
    if (!c.data) return false;
    
    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
    const dataEventoStr = c.data.split("T")[0];

    if (filtroAtivo === "hoje") return dataEventoStr === hojeStr;
    if (filtroAtivo === "atrasadas") return dataEventoStr < hojeStr;
    if (filtroAtivo === "semana") {
      const proximaSemana = new Date(hoje);
      proximaSemana.setDate(hoje.getDate() + 7);
      const proxSemanaStr = `${proximaSemana.getFullYear()}-${String(proximaSemana.getMonth() + 1).padStart(2, "0")}-${String(proximaSemana.getDate()).padStart(2, "0")}`;
      return dataEventoStr >= hojeStr && dataEventoStr <= proxSemanaStr;
    }
    return true;
  });

  // Lógica para buscar Subtarefas
  const toggleSubtarefas = async (tarefaId) => {
    if (tarefaExpandida === tarefaId) {
      setTarefaExpandida(null);
      return;
    }

    setTarefaExpandida(tarefaId);

    if (subtarefasCache[tarefaId]) return;

    try {
      setCarregandoSubs(true);
      const resposta = await subtarefaService.listarPorTarefa(tarefaId);
      
      let listaReal = [];
      if (Array.isArray(resposta)) listaReal = resposta;
      else if (resposta && Array.isArray(resposta.data)) listaReal = resposta.data;
      else if (resposta && resposta.data && Array.isArray(resposta.data.data)) listaReal = resposta.data.data;

      setSubtarefasCache(prev => ({ ...prev, [tarefaId]: listaReal }));
    } catch (error) {
      console.error("Erro ao buscar subtarefas:", error);
    } finally {
      setCarregandoSubs(false);
    }
  };

  if (carregando) return <div className="loading-screen">Carregando estudos...</div>;

  const primeiroNome = usuario?.nome ? usuario.nome.split(" ")[0] : "Usuário";

  return (
    <div className="estudos-container">
      <div className="estudos-header">
        <div className="estudos-greeting">
          <h1>Olá, {primeiroNome} 👋</h1>
          <p>Você tem {cronogramas.length} cronogramas agendados</p>
        </div>
        <div className="estudos-header-actions">
          <button className="btn-notificacao" onClick={() => navigate("/notificacoes")}>
            🔔 
            {totalNotificacoes > 0 && <span className="dot-notif"></span>}
          </button>
          <button className="btn-novo-estudo desktop-only" onClick={() => setModalAberto(true)}>
            + Novo estudo
          </button>
        </div>
      </div>

      <div className="estudos-filtros">
        <button className={`filtro-btn ${filtroAtivo === "todas" ? "active" : ""}`} onClick={() => setFiltroAtivo("todas")}>Todas</button>
        <button className={`filtro-btn ${filtroAtivo === "hoje" ? "active" : ""}`} onClick={() => setFiltroAtivo("hoje")}>Hoje</button>
        <button className={`filtro-btn ${filtroAtivo === "semana" ? "active" : ""}`} onClick={() => setFiltroAtivo("semana")}>Esta Semana</button>
        <button className={`filtro-btn ${filtroAtivo === "atrasadas" ? "active" : ""}`} onClick={() => setFiltroAtivo("atrasadas")}>Atrasadas</button>
      </div>

      <div className="estudos-secao-header">
        <h2>Meus Estudos</h2>
        <a href="/calendario" className="link-calendario">Ver calendário</a>
      </div>

      <div className="estudos-grid">
        {cronogramasFiltrados.length === 0 ? (
          <p style={{ textAlign: "center", width: "100%", color: "var(--texto-secundario)" }}>Nenhum estudo encontrado neste filtro.</p>
        ) : (
          cronogramasFiltrados.map((crono) => {
            const tarefaVinculada = tarefas.find(t => t.id === crono.tarefa_id);
            const progresso = tarefaVinculada?.progresso || 0;

            return (
              <div key={crono.id} className="estudo-card">
                <div className="card-top">
                  <div className="card-titulo">
                    <div className="icone-disciplina">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                    </div>
                    <h3>{tarefaVinculada ? tarefaVinculada.titulo : (crono.disciplina || "Sem disciplina")}</h3>
                  </div>
                  <span className="badge-prioridade alta">Estudo</span>
                </div>

                <div className="card-data">
                  📅 {crono.data ? formatarData(crono.data) : "Sem data"} 
                  {" | "} 
                  🕐 {crono.hora_inicio ? formatarHorario(crono.hora_inicio) : ""}
                  {" | "}
                  📚 {crono.disciplina}
                </div>

                <div className="card-progresso-container">
                  <div className="progresso-info">
                    <span>Progresso</span>
                    <span className="percentual">{progresso}%</span>
                  </div>
                  <div className="progresso-bar-bg">
                    <div className="progresso-bar-fill" style={{ width: `${progresso}%` }}></div>
                  </div>
                </div>

                {tarefaVinculada && (
                  <button 
                    onClick={() => toggleSubtarefas(tarefaVinculada.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--purple-main)", fontSize: "0.8rem", marginTop: "0.5rem", textAlign: "left", padding: 0, fontWeight: 600 }}
                  >
                    {tarefaExpandida === tarefaVinculada.id ? "▲ Ocultar Subtarefas" : "▼ Ver Subtarefas"}
                  </button>
                )}

                {tarefaExpandida === tarefaVinculada?.id && (
                  <div style={{ marginTop: "0.5rem", paddingLeft: "1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {carregandoSubs && !subtarefasCache[tarefaVinculada.id] ? (
                      <span style={{ fontSize: "0.8rem", color: "var(--cinza-400)" }}>Buscando no banco...</span>
                    ) : subtarefasCache[tarefaVinculada.id]?.length === 0 ? (
                      <span style={{ fontSize: "0.8rem", color: "var(--cinza-400)" }}>Nenhuma subtarefa cadastrada.</span>
                    ) : (
                      subtarefasCache[tarefaVinculada.id]?.map(sub => {
                        const isConcluida = sub.concluida === 1 || sub.concluida === true || sub.concluida === '1';
                        return (
                          <span key={sub.id} style={{ fontSize: "0.85rem", color: "var(--texto-secundario)", textDecoration: isConcluida ? "line-through" : "none" }}>
                            • {sub.titulo} {isConcluida && "✓"}
                          </span>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <button className="fab-novo-estudo mobile-only" onClick={() => setModalAberto(true)}>+</button>

      <ModalTarefa
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        tipo="estudo"
        onSalvarSucesso={carregarDados}
      />
    </div>
  );
}