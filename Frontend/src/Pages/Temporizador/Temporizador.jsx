import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Flame, Square } from "lucide-react";
import "../../Assets/Styles/Pages/Temporizador.css";
import { estudoService } from "../../Services/estudoService";
import { disciplinaService } from "../../Services/disciplinaService";

export default function Temporizador() {
  // --- Estados de Configuração (Agora editáveis) ---
  const [tecnica, setTecnica] = useState("pomodoro");
  const [focoMin, setFocoMin] = useState(25);
  const [pausaCurtaMin, setPausaCurtaMin] = useState(5);
  const [pausaLongaMin, setPausaLongaMin] = useState(15);
  const [qtdBlocos, setQtdBlocos] = useState(4);
  
  // --- Estados do Timer ---
  const [tempo, setTempo] = useState(25 * 60);
  const [rodando, setRodando] = useState(false);
  const [blocoAtual, setBlocoAtual] = useState(1);
  
  // --- Estados de Back-end ---
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState("");
  const [sessaoAtiva, setSessaoAtiva] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const intervalRef = useRef(null);

  // 1. Carrega disciplinas e verifica sessão ativa
  useEffect(() => {
    const inicializar = async () => {
      try {
        const [discData, sessaoData] = await Promise.all([
          disciplinaService.listar(),
          estudoService.sessaoAtiva()
        ]);
        
        setDisciplinas(discData);
        
        // Se houver sessão rodando no banco, recupera
        if (sessaoData.data && sessaoData.data.id) {
          const sessao = sessaoData.data;
          setSessaoAtiva(sessao);
          setDisciplinaSelecionada(sessao.disciplina);
          setTecnica(sessao.tecnica_usada || "pomodoro");
          setRodando(sessao.estado === "em_andamento");
          
          // Calcula o tempo decorrido com base no que o Back-end salvou
          const decorrido = sessao.tempo_segundos || 0;
          const totalFoco = (sessao.foco_min || 25) * 60;
          setTempo(Math.max(0, totalFoco - decorrido));
          
          setFocoMin(sessao.foco_min || 25);
          setPausaCurtaMin(sessao.pausa_min || 5);
          setQtdBlocos(sessao.blocos_planejados || 4);
          setBlocoAtual((sessao.blocos_concluidos || 0) + 1);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setCarregando(false);
      }
    };
    inicializar();
  }, []);

  // 2. Lógica do cronômetro
  useEffect(() => {
    if (rodando && tempo > 0) {
      intervalRef.current = setInterval(() => {
        setTempo((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRodando(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [rodando, tempo]);

  // Formata o tempo (MM:SS)
  const formatarTempo = (segundos) => {
    const m = String(Math.floor(segundos / 60)).padStart(2, "0");
    const s = String(segundos % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- Ações conectadas ao Back-end ---
  const iniciarSessao = async () => {
    if (!disciplinaSelecionada) {
      setErro("Selecione uma disciplina antes de iniciar.");
      return;
    }
    setErro("");
    try {
      const novaSessao = await estudoService.iniciarSessao({
        disciplina: disciplinaSelecionada,
        tecnica_usada: tecnica,
        foco_min: Number(focoMin),
        pausa_min: Number(pausaCurtaMin),
        blocos: Number(qtdBlocos)
      });
      setSessaoAtiva(novaSessao.data);
      setTempo(focoMin * 60);
      setBlocoAtual(1);
      setRodando(true);
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao iniciar sessão no servidor.");
    }
  };

  const pausarSessao = async () => {
    if (!sessaoAtiva) return;
    try {
      await estudoService.pausarSessao(sessaoAtiva.id);
      setRodando(false);
    } catch (error) {
      setErro("Erro ao pausar sessão.");
    }
  };

  const retomarSessao = () => setRodando(true);

  const encerrarSessao = async () => {
    if (!sessaoAtiva) return;
    try {
      await estudoService.encerrarSessao(sessaoAtiva.id, "Finalizado pelo usuário");
      setSessaoAtiva(null);
      setRodando(false);
      setTempo(focoMin * 60);
      setBlocoAtual(1);
    } catch (error) {
      setErro("Erro ao encerrar sessão.");
    }
  };

  // Quando o tempo zera, avança o bloco (Lógica simples local)
  useEffect(() => {
    if (tempo === 0 && sessaoAtiva) {
      if (blocoAtual < qtdBlocos) {
        alert(`Fim do bloco ${blocoAtual}! Faça uma pausa de ${pausaCurtaMin} minutos.`);
        setBlocoAtual(prev => prev + 1);
        setTempo(focoMin * 60); // Volta ao foco (num app real, entraria em pausa)
      } else {
        alert("Todos os blocos concluídos! Sessão finalizada.");
        encerrarSessao();
      }
    }
  }, [tempo, sessaoAtiva, blocoAtual, qtdBlocos, focoMin, pausaCurtaMin]);

  // Cálculo do progresso para o círculo SVG
  const tempoTotal = focoMin * 60;
  const progresso = ((tempoTotal - tempo) / tempoTotal) * 100;
  const raio = 120;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia - (progresso / 100) * circunferencia;

  if (carregando) return <div className="loading-screen">Carregando timer...</div>;

  return (
    <div className="timer-page">
      {/* Header */}
      <header className="timer-header">
        <h1>Foco</h1>
        <div className="streak-badge">
          <Flame size={16} color="#d97706" />
          <span>Bloco {blocoAtual} de {qtdBlocos}</span>
        </div>
      </header>

      {erro && <div className="error-message" style={{ marginBottom: "1rem" }}>{erro}</div>}

      {/* Painel Principal */}
      <div className="timer-panel">
        
        {/* Abas (Só funcionam se não tiver sessão ativa) */}
        <div className="timer-tabs">
          <button
            className={tecnica === "pomodoro" ? "active" : ""}
            onClick={() => { setTecnica("pomodoro"); setTempo(focoMin * 60); }}
            disabled={!!sessaoAtiva}
          >
            Pomodoro
          </button>
          <button
            className={tecnica === "curto" ? "active" : ""}
            onClick={() => { setTecnica("curto"); setTempo(pausaCurtaMin * 60); }}
            disabled={!!sessaoAtiva}
          >
            Intervalo Curto
          </button>
          <button
            className={tecnica === "longo" ? "active" : ""}
            onClick={() => { setTecnica("longo"); setTempo(pausaLongaMin * 60); }}
            disabled={!!sessaoAtiva}
          >
            Longo
          </button>
        </div>

        {/* CONFIGURAÇÕES DO POMODORO (Só aparecem se não estiver rodando) */}
        {!sessaoAtiva && tecnica === "pomodoro" && (
          <div className="pomodoro-config" style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", fontWeight: 600 }}>
              Foco (min)
              <input type="number" min="1" max="120" value={focoMin} onChange={(e) => { setFocoMin(e.target.value); setTempo(e.target.value * 60); }} style={{ width: "80px", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--cinza-200)" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", fontWeight: 600 }}>
              Pausa Curta (min)
              <input type="number" min="1" max="30" value={pausaCurtaMin} onChange={(e) => setPausaCurtaMin(e.target.value)} style={{ width: "80px", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--cinza-200)" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", fontWeight: 600 }}>
              Pausa Longa (min)
              <input type="number" min="1" max="60" value={pausaLongaMin} onChange={(e) => setPausaLongaMin(e.target.value)} style={{ width: "80px", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--cinza-200)" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", fontWeight: 600 }}>
              Blocos
              <input type="number" min="1" max="12" value={qtdBlocos} onChange={(e) => setQtdBlocos(e.target.value)} style={{ width: "80px", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--cinza-200)" }} />
            </label>
          </div>
        )}

        {/* Círculo do Timer */}
        <div className="timer-circle-container">
          <svg className="timer-svg" width="280" height="280">
            <circle className="timer-bg" cx="140" cy="140" r={raio} strokeWidth="8" fill="none" />
            <circle
              className="timer-progress"
              cx="140" cy="140" r={raio} strokeWidth="8" fill="none"
              strokeDasharray={circunferencia}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="timer-text">
            <h2>{formatarTempo(tempo)}</h2>
            <span>SESSÃO {blocoAtual}/{qtdBlocos}</span>
          </div>
        </div>

        {/* Tarefa Atual / Seleção de Disciplina */}
        <div className="timer-task" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.5rem" }}>
          {!sessaoAtiva ? (
            <>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--texto-secundario)" }}>Selecione a disciplina:</label>
              <select 
                className="input-field" 
                value={disciplinaSelecionada}
                onChange={(e) => setDisciplinaSelecionada(e.target.value)}
                style={{ width: "100%", height: "48px" }}
              >
                <option value="">-- Escolha --</option>
                {disciplinas.map(d => <option key={d.id} value={d.nome}>{d.nome}</option>)}
              </select>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%" }}>
              <div className="task-icon"><Square size={16} color="var(--purple-main)" /></div>
              <div className="task-info">
                <h3>{sessaoAtiva.disciplina}</h3>
                <p>Técnica: {sessaoAtiva.tecnica_usada}</p>
              </div>
            </div>
          )}
        </div>

        <p className="timer-quote">"Mantenha o foco. O progresso acontece passo a passo."</p>

        {/* Controles */}
        <div className="timer-controls">
          <button className="btn-control secondary" onClick={() => setTempo(focoMin * 60)}>
            <RotateCcw size={20} />
          </button>

          {!sessaoAtiva ? (
            <button className="btn-control primary" onClick={iniciarSessao}>
              <Play size={24} fill="white" style={{ marginLeft: "4px" }} />
            </button>
          ) : (
            <>
              <button className="btn-control primary" onClick={rodando ? pausarSessao : retomarSessao}>
                {rodando ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" style={{ marginLeft: "4px" }} />}
              </button>
              <button className="btn-control secondary" onClick={encerrarSessao} style={{ color: "#ef4444", borderColor: "#ef4444" }}>
                <Square size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}