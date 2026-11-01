// ============================================================
// PAGE - Área 3: Temporizador
// Study+
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import {
  TECNICA_TEMPO,
  TECNICA_LABEL,
  POMODORO_CONFIG,
} from "../../Utils/constants";
import {
  iniciarSessao,
  finalizarSessao,
} from "../../Controllers/estudoController";
import "./Temporizador.css";
import { disciplinaService } from "../../Services/disciplinaService";

function formatarTempo(segundos) {
  const m = String(Math.floor(segundos / 60)).padStart(2, "0");
  const s = String(segundos % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function Temporizador() {
  const [tecnica, setTecnica] = useState(TECNICA_TEMPO.POMODORO);
  const [disciplina, setDisciplina] = useState("");
  const [anotacao, setAnotacao] = useState("");
  const [rodando, setRodando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [segundos, setSegundos] = useState(POMODORO_CONFIG.FOCO_MINUTOS * 60);
  const [ciclo, setCiclo] = useState(1);
  const [fase, setFase] = useState("foco"); // foco | pausa_curta | pausa_longa
  const [sessaoId, setSessaoId] = useState(null);
  const [minutosTotais, setMinutosTotais] = useState(0);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const intervalRef = useRef(null);

  const tempoInicial = {
    foco: POMODORO_CONFIG.FOCO_MINUTOS * 60,
    pausa_curta: POMODORO_CONFIG.PAUSA_CURTA_MINUTOS * 60,
    pausa_longa: POMODORO_CONFIG.PAUSA_LONGA_MINUTOS * 60,
  };

  const [disciplinas, setDisciplinas] = useState([]);

  useEffect(() => {
    disciplinaService
      .listar()
      .then(setDisciplinas)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tecnica === TECNICA_TEMPO.POMODORO) {
      setSegundos(tempoInicial[fase]);
    } else {
      setSegundos(0);
    }
    pararTimer();
  }, [tecnica, fase]);

  useEffect(() => {
    if (rodando && !pausado) {
      intervalRef.current = setInterval(() => {
        setSegundos((prev) => {
          if (tecnica === TECNICA_TEMPO.POMODORO) {
            if (prev <= 1) {
              clearInterval(intervalRef.current);
              avancarFasePomodoro();
              return 0;
            }
            return prev - 1;
          } else {
            setMinutosTotais((m) => m + 1 / 60);
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [rodando, pausado, tecnica]);

  function avancarFasePomodoro() {
    if (fase === "foco") {
      const novosCiclos = ciclo + 1;
      setCiclo(novosCiclos);
      if (novosCiclos % POMODORO_CONFIG.CICLOS_ATE_PAUSA_LONGA === 0) {
        setFase("pausa_longa");
        setMensagem("Pausa longa! Descanse 15 minutos.");
      } else {
        setFase("pausa_curta");
        setMensagem("Pausa curta! Respire por 5 minutos.");
      }
    } else {
      setFase("foco");
      setMensagem("Hora de focar!");
    }
    notificar();
  }

  function notificar() {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Study+ Temporizador", {
        body: "Fase concluída! Verifique o temporizador.",
      });
    }
  }

  async function iniciar() {
    if (!disciplina) {
      setErro("Selecione uma disciplina antes de iniciar.");
      return;
    }
    setErro("");
    try {
      const sessao = await iniciarSessao({
        disciplina,
        tecnica_usada: tecnica,
      });
      setSessaoId(sessao.id);
      setRodando(true);
      setPausado(false);
      setMensagem("");
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    } catch (e) {
      setErro(e.message);
    }
  }

  function pausar() {
    setPausado((p) => !p);
  }

  function pararTimer() {
    clearInterval(intervalRef.current);
    setRodando(false);
    setPausado(false);
  }

  async function encerrar() {
    pararTimer();
    if (!sessaoId) return;

    let duracao;
    if (tecnica === TECNICA_TEMPO.POMODORO) {
      const decorrido = tempoInicial[fase] - segundos;
      const segundosTotais =
        (ciclo - 1) * POMODORO_CONFIG.FOCO_MINUTOS * 60 + decorrido;
      duracao = Math.max(1, Math.round(segundosTotais / 60));
    } else {
      duracao = Math.max(1, Math.round(segundos / 60));
    }

    try {
      await finalizarSessao(sessaoId, duracao, anotacao);
      setMensagem(
        `Sessão encerrada! ${duracao < 1 ? "menos de 1 minuto" : `${duracao} minuto${duracao === 1 ? "" : "s"}`} registrados.`,
      );
    } catch (e) {
      setErro(e.message);
    }
    setSessaoId(null);
    setSegundos(tecnica === TECNICA_TEMPO.POMODORO ? tempoInicial.foco : 0);
    setCiclo(1);
    setFase("foco");
    setMinutosTotais(0);
    setAnotacao("");
  }

  const porcentagem =
    tecnica === TECNICA_TEMPO.POMODORO
      ? Math.round(((tempoInicial[fase] - segundos) / tempoInicial[fase]) * 100)
      : null;

  return (
    <div className="temporizador-page">
      <h1 className="temporizador-titulo">Temporizador</h1>

      {/* Seletor de técnica */}
      <div className="tecnica-selector">
        {Object.values(TECNICA_TEMPO).map((t) => (
          <button
            key={t}
            className={`tecnica-btn ${tecnica === t ? "ativo" : ""}`}
            onClick={() => setTecnica(t)}
            disabled={rodando}
          >
            {TECNICA_LABEL[t]}
          </button>
        ))}
      </div>

      {/* Seletor de disciplina */}
      <div className="disciplina-selector">
        <select
          value={disciplina}
          onChange={(e) => setDisciplina(e.target.value)}
          disabled={rodando}
          className="disciplina-select"
        >
          <option value="">Selecione a disciplina</option>
          {disciplinas.map((d) => (
            <option key={d.id} value={d.nome}>
              {d.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Display do timer */}
      <div className="timer-display">
        {tecnica === TECNICA_TEMPO.POMODORO ? (
          <>
            <div className="fase-label">
              {fase === "foco"
                ? "Foco"
                : fase === "pausa_curta"
                  ? "Pausa Curta"
                  : "Pausa Longa"}
            </div>
            <div className="timer-relogio">{formatarTempo(segundos)}</div>
            <div className="ciclo-label">Ciclo {ciclo}</div>
            <div className="progresso-bar">
              <div
                className="progresso-fill"
                style={{ width: `${porcentagem}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="fase-label">{TECNICA_LABEL[tecnica]}</div>
            <div className="timer-relogio">{formatarTempo(segundos)}</div>
          </>
        )}
      </div>

      {/* Anotação */}
      {rodando && (
        <textarea
          className="anotacao-input"
          placeholder="Anotações da sessão (opcional)..."
          value={anotacao}
          onChange={(e) => setAnotacao(e.target.value)}
          rows={3}
        />
      )}

      {/* Controles */}
      <div className="controles">
        {!rodando ? (
          <button className="btn-iniciar" onClick={iniciar}>
            Iniciar
          </button>
        ) : (
          <>
            <button className="btn-pausar" onClick={pausar}>
              {pausado ? "Retomar" : "Pausar"}
            </button>
            <button className="btn-encerrar" onClick={encerrar}>
              Encerrar
            </button>
          </>
        )}
      </div>

      {/* Feedback */}
      {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}
      {erro && <p className="mensagem-erro">{erro}</p>}
    </div>
  );
}