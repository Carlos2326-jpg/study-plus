import React, { useState, useEffect } from "react";
import {
  PlayCircle,
  PauseCircle,
  RotateCcw,
  ChevronRight,
  Flame,
  Square,
  PenLine,
} from "lucide-react";
import "../../Assets/Styles/Pages/Temporizador.css";

export default function Temporizador() {
  const [tempo, setTempo] = useState(25 * 60);
  const [rodando, setRodando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("pomodoro");

  // Lógica básica do timer (você pode integrar com o back-end depois)
  useEffect(() => {
    let interval = null;
    if (rodando && tempo > 0) {
      interval = setInterval(() => setTempo((t) => t - 1), 1000);
    } else if (tempo === 0) {
      setRodando(false);
    }
    return () => clearInterval(interval);
  }, [rodando, tempo]);

  const formatarTempo = (segundos) => {
    const m = String(Math.floor(segundos / 60)).padStart(2, "0");
    const s = String(segundos % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // Cálculo do progresso para o círculo SVG
  const tempoTotal =
    abaAtiva === "pomodoro" ? 25 * 60 : abaAtiva === "curto" ? 5 * 60 : 15 * 60;
  const progresso = ((tempoTotal - tempo) / tempoTotal) * 100;
  const raio = 120;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia - (progresso / 100) * circunferencia;

  return (
    <div className="timer-page">
      {/* Header */}
      <header className="timer-header">
        <h1>Foco</h1>
        <div className="streak-badge">
          <Flame size={16} color="#d97706" />
          <span>5 dias</span>
        </div>
      </header>

      {/* Painel Principal */}
      <div className="timer-panel">
        {/* Abas */}
        <div className="timer-tabs">
          <button
            className={abaAtiva === "pomodoro" ? "active" : ""}
            onClick={() => {
              setAbaAtiva("pomodoro");
              setTempo(25 * 60);
              setRodando(false);
            }}
          >
            Pomodoro
          </button>
          <button
            className={abaAtiva === "curto" ? "active" : ""}
            onClick={() => {
              setAbaAtiva("curto");
              setTempo(5 * 60);
              setRodando(false);
            }}
          >
            Intervalo Curto
          </button>
          <button
            className={abaAtiva === "longo" ? "active" : ""}
            onClick={() => {
              setAbaAtiva("longo");
              setTempo(15 * 60);
              setRodando(false);
            }}
          >
            Longo
          </button>
        </div>

        {/* Círculo do Timer */}
        <div className="timer-circle-container">
          <svg className="timer-svg" width="280" height="280">
            <circle
              className="timer-bg"
              cx="140"
              cy="140"
              r={raio}
              strokeWidth="8"
              fill="none"
            />
            <circle
              className="timer-progress"
              cx="140"
              cy="140"
              r={raio}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circunferencia}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="timer-text">
            <h2>{formatarTempo(tempo)}</h2>
            <span>SESSÃO 1/4</span>
          </div>
        </div>

        {/* Tarefa Atual */}
        <div className="timer-task">
          <div className="task-icon">
            <Square size={16} color="var(--purple-main)" />
          </div>
          <div className="task-info">
            <h3>Criar fluxo de checkout</h3>
            <p>Design de Interface</p>
          </div>
          <button
            className="btn-control secondary"
            onClick={() => setTempo(tempoTotal)}
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Frase Motivacional */}
        <p className="timer-quote">
          "Mantenha o foco. O progresso acontece passo a passo."
        </p>

        {/* Controles */}
        <div className="timer-controls">
          <button
            className="btn-control secondary"
            onClick={() => setTempo(tempoTotal)}
          >
            <RotateCcw size={20} />
          </button>
          <button
            className="btn-control primary"
            onClick={() => setRodando(!rodando)}
          >
            {rodando ? (
              <PauseCircle size={24} fill="white" />
            ) : (
              <PlayCircle
                size={24}
                fill="white"
                style={{ marginLeft: "4px" }}
              />
            )}
          </button>
          <button className="btn-control secondary">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
