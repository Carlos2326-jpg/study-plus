import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../Assets/Styles/Pages/EstudosPage.css";
import { tarefaService } from "../../Services/tarefaService";
import { disciplinaService } from "../../Services/disciplinaService";
import { estudoService } from "../../Services/estudoService"; // NOVO IMPORT
import { notificacaoService } from "../../Services/notificacaoService";
import ModalTarefa from "../../Components/Modals/ModalTarefa";
import { formatarData } from "../../Utils/formatters";
import { useAuth } from "../../Controllers/authController";

export default function TarefasPage() {
  const { usuario } = useAuth(); 
  const navigate = useNavigate();
  
  const [tarefas, setTarefas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [cronogramas, setCronogramas] = useState([]); // NOVO ESTADO
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroAtivo, setFiltroAtivo] = useState("todas");
  const [totalNotificacoes, setTotalNotificacoes] = useState(0);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const [tarefasData, disciplinasData, cronogramasData] = await Promise.all([
        tarefaService.listar(),
        disciplinaService.listar(),
        estudoService.listarCronogramas() // Busca os cronogramas
      ]);
      setTarefas(tarefasData);
      setDisciplinas(disciplinasData);
      setCronogramas(cronogramasData.data || cronogramasData); // Salva para usar no filtro
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    
    notificacaoService.listar()
      .then(res => setTotalNotificacoes(res.total || 0))
      .catch(() => {});
  }, [carregarDados]);

  // LÓGICA DE FILTRO
  const tarefasFiltradas = tarefas.filter(t => {
    // 1. A MÁGICA: Oculta tarefas que têm um cronograma vinculado (pois são estudos)
    const temCronograma = cronogramas.some(c => c.tarefa_id === t.id);
    if (temCronograma) return false;

    // 2. Aplica os filtros normais de data
    if (filtroAtivo === "todas") return true;
    if (!t.prazo) return false;
    
    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
    const prazoTarefaStr = t.prazo.split("T")[0]; 

    if (filtroAtivo === "hoje") return prazoTarefaStr === hojeStr;
    if (filtroAtivo === "atrasadas") return prazoTarefaStr < hojeStr && t.status !== "concluida";
    if (filtroAtivo === "semana") {
      const proximaSemana = new Date(hoje);
      proximaSemana.setDate(hoje.getDate() + 7);
      const proxSemanaStr = `${proximaSemana.getFullYear()}-${String(proximaSemana.getMonth() + 1).padStart(2, "0")}-${String(proximaSemana.getDate()).padStart(2, "0")}`;
      return prazoTarefaStr >= hojeStr && prazoTarefaStr <= proxSemanaStr;
    }
    return true;
  });

  if (carregando) return <div className="loading-screen">Carregando tarefas...</div>;

  const primeiroNome = usuario?.nome ? usuario.nome.split(" ")[0] : "Usuário";

  return (
    <div className="estudos-container">
      <div className="estudos-header">
        <div className="estudos-greeting">
          <h1>Olá, {primeiroNome} 👋</h1>
          <p>Você tem {tarefasFiltradas.length} tarefas cadastradas</p>
        </div>
        <div className="estudos-header-actions">
          <button className="btn-notificacao" onClick={() => navigate("/notificacoes")}>
            🔔 
            {totalNotificacoes > 0 && <span className="dot-notif"></span>}
          </button>
          <button className="btn-novo-estudo desktop-only" onClick={() => setModalAberto(true)}>
            + Nova tarefa
          </button>
        </div>
      </div>
      
      {/* ... (Resto do código igual, mantendo os filtros e o grid de cards) ... */}
      {/* Copie o resto do return do código anterior que é idêntico */}
      
      <div className="estudos-filtros">
        <button className={`filtro-btn ${filtroAtivo === "todas" ? "active" : ""}`} onClick={() => setFiltroAtivo("todas")}>Todas</button>
        <button className={`filtro-btn ${filtroAtivo === "hoje" ? "active" : ""}`} onClick={() => setFiltroAtivo("hoje")}>Hoje</button>
        <button className={`filtro-btn ${filtroAtivo === "semana" ? "active" : ""}`} onClick={() => setFiltroAtivo("semana")}>Esta Semana</button>
        <button className={`filtro-btn ${filtroAtivo === "atrasadas" ? "active" : ""}`} onClick={() => setFiltroAtivo("atrasadas")}>Atrasadas</button>
      </div>

      <div className="estudos-secao-header">
        <h2>Minhas Tarefas</h2>
        <a href="/calendario" className="link-calendario">Ver calendário</a>
      </div>

      <div className="estudos-grid">
        {tarefasFiltradas.length === 0 ? (
          <p style={{ textAlign: "center", width: "100%", color: "var(--texto-secundario)" }}>Nenhuma tarefa encontrada.</p>
        ) : (
          tarefasFiltradas.map((tarefa) => {
            const disciplina = disciplinas.find(d => d.id === tarefa.disciplina_id);
            const percentualProgresso = tarefa.progresso || 0;

            return (
              <div key={tarefa.id} className="estudo-card">
                <div className="card-top">
                  <div className="card-titulo" style={{ alignItems: 'flex-start' }}>
                    <div className="icone-disciplina" style={{ marginTop: '2px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                    </div>
                    <div className="titulo-e-categoria">
                      <h3>{tarefa.titulo}</h3>
                      <span className="card-categoria">{disciplina ? disciplina.nome : "Sem disciplina"}</span>
                    </div>
                  </div>
                  <span className={`badge-prioridade ${tarefa.prioridade}`}>
                    {tarefa.prioridade}
                  </span>
                </div>

                <div className="card-data">
                  📅 {tarefa.prazo ? formatarData(tarefa.prazo) : "Sem prazo"}
                </div>

                <div className="card-progresso-container">
                  <div className="progresso-info">
                    <span>Progresso</span>
                    <span className="percentual">{percentualProgresso}%</span>
                  </div>
                  <div className="progresso-bar-bg">
                    <div className="progresso-bar-fill" style={{ width: `${percentualProgresso}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button className="fab-novo-estudo mobile-only" onClick={() => setModalAberto(true)}>+</button>

      <ModalTarefa 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)} 
        tipo="tarefa" 
        onSalvarSucesso={carregarDados} 
      />
    </div>
  );
}