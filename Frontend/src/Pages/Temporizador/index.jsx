// ============================================================
// PAGE - Área 3: Temporizador (tempo e estado guardados no servidor)
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
  sessaoAtiva,
  pausarSessao,
  retomarSessao,
  pingSessao,
  registrarBloco,
  encerrarSessao,
} from "../../Controllers/estudoController";
import "./Temporizador.css";
import { disciplinaService } from "../../Services/disciplinaService";

function formatarTempo(segundos) {
  const t = Math.max(0, Math.floor(segundos));
  const h = Math.floor(t / 3600);
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

const mensagemDoErro = (e) => e?.response?.data?.message || e?.message || "Erro inesperado.";

function notificar(texto) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Study+ Temporizador", { body: texto });
  }
}

export default function Temporizador() {
  const [tecnica, setTecnica] = useState(TECNICA_TEMPO.POMODORO);
  const [disciplina, setDisciplina] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);
  const [foco, setFoco] = useState(POMODORO_CONFIG.FOCO_MINUTOS);
  const [intervalo, setIntervalo] = useState(POMODORO_CONFIG.PAUSA_CURTA_MINUTOS);
  const [blocos, setBlocos] = useState(POMODORO_CONFIG.CICLOS_ATE_PAUSA_LONGA);
  const [anotacao, setAnotacao] = useState("");

  const [sessao, setSessao] = useState(null); // resposta do servidor
  const [recebidoEm, setRecebidoEm] = useState(Date.now());
  const [agora, setAgora] = useState(Date.now());
  const [intervaloFim, setIntervaloFim] = useState(null); // fim do intervalo do Pomodoro
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const ocupado = useRef(false);

  function aplicar(s) {
    setSessao(s);
    setRecebidoEm(Date.now());
    setAgora(Date.now());
  }

  async function ressincronizar() {
    try {
      const s = await sessaoAtiva();
      if (s) aplicar(s);
      else setSessao(null);
    } catch {
      /* mantém a tela como está */
    }
  }

  // Carrega disciplinas e recupera a sessão em andamento (se houver)
  useEffect(() => {
    disciplinaService.listar().then(setDisciplinas).catch(() => {});
    sessaoAtiva()
      .then((s) => {
        if (!s) return;
        aplicar(s);
        setTecnica(s.tecnica_usada);
        setDisciplina(s.disciplina);
        setAnotacao(s.anotacao || "");
        setMensagem(
          s.estado === "pausada"
            ? "Sessão em andamento recuperada (pausada). Toque em Retomar para continuar."
            : "Sessão em andamento recuperada.",
        );
      })
      .catch(() => {});
  }, []);

  // Relógio da tela (1 por segundo)
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const rodando = sessao?.estado === "em_andamento";

  // Sinal de vida a cada 30 s (o servidor pausa a sessão após 2 min sem sinal)
  useEffect(() => {
    if (!sessao?.id || !rodando) return;
    const id = sessao.id;
    const t = setInterval(() => {
      pingSessao(id)
        .then((s) => {
          if (!ocupado.current) aplicar(s);
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(t);
  }, [sessao?.id, rodando]);

  // ---------- Valores calculados ----------
  const tecnicaAtual = sessao ? sessao.tecnica_usada : tecnica;
  const ehPomodoro = tecnicaAtual === TECNICA_TEMPO.POMODORO;
  const decorrido = sessao
    ? Math.floor(sessao.tempo_segundos + (rodando ? (agora - recebidoEm) / 1000 : 0))
    : 0;
  const focoSeg = (sessao?.foco_min || foco) * 60;
  const blocosFeitos = sessao?.blocos_concluidos || 0;
  const noBloco = decorrido - blocosFeitos * focoSeg;
  const restante = Math.max(0, focoSeg - noBloco);
  const emIntervalo = !!intervaloFim && agora < intervaloFim;
  const restanteIntervalo = emIntervalo ? Math.ceil((intervaloFim - agora) / 1000) : 0;

  // Terminou o tempo de foco: registra o bloco e começa o intervalo
  useEffect(() => {
    if (!sessao || !ehPomodoro || !rodando || restante > 0 || ocupado.current) return;
    concluirBloco();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restante, rodando]);

  // Terminou o intervalo: volta ao foco
  useEffect(() => {
    if (!intervaloFim || agora < intervaloFim || ocupado.current || !sessao) return;
    setIntervaloFim(null);
    retomar(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agora, intervaloFim]);

  // ---------- Ações ----------
  async function iniciar() {
    if (!disciplina) {
      setErro("Selecione uma disciplina antes de iniciar.");
      return;
    }
    setErro("");
    setMensagem("");
    try {
      const dados = { disciplina, tecnica_usada: tecnica };
      if (tecnica === TECNICA_TEMPO.POMODORO) {
        Object.assign(dados, { foco_min: foco, pausa_min: intervalo, blocos });
      }
      aplicar(await iniciarSessao(dados));
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    } catch (e) {
      setErro(mensagemDoErro(e));
    }
  }

  async function pausar() {
    if (ocupado.current || !sessao) return;
    ocupado.current = true;
    setErro("");
    try {
      aplicar(await pausarSessao(sessao.id));
    } catch (e) {
      setErro(mensagemDoErro(e));
      await ressincronizar();
    } finally {
      ocupado.current = false;
    }
  }

  async function retomar(automatico = false) {
    if (ocupado.current || !sessao) return;
    ocupado.current = true;
    setErro("");
    try {
      aplicar(await retomarSessao(sessao.id));
      setIntervaloFim(null);
      setMensagem(automatico ? "Intervalo encerrado. Hora de focar!" : "");
      if (automatico) notificar("Intervalo encerrado. Hora de focar!");
    } catch (e) {
      setErro(mensagemDoErro(e));
      await ressincronizar();
    } finally {
      ocupado.current = false;
    }
  }

  async function concluirBloco() {
    ocupado.current = true;
    try {
      let s = await registrarBloco(sessao.id);
      if (s.blocos_concluidos >= s.blocos_planejados) {
        mostrarResumo(await encerrarSessao(s.id, anotacao), true);
        return;
      }
      s = await pausarSessao(s.id);
      aplicar(s);
      setIntervaloFim(Date.now() + (s.pausa_min || 5) * 60000);
      setMensagem(
        `Bloco ${s.blocos_concluidos} de ${s.blocos_planejados} concluído! Intervalo de ${s.pausa_min} min.`,
      );
      notificar("Bloco concluído! Hora do intervalo.");
    } catch (e) {
      setErro(mensagemDoErro(e));
      await ressincronizar();
    } finally {
      ocupado.current = false;
    }
  }

  function mostrarResumo(fim, completo = false) {
    const min = fim.duracao_minutos ?? Math.round(fim.tempo_segundos / 60);
    setMensagem(
      `${completo ? "Todos os blocos concluídos! " : "Sessão encerrada! "}` +
        `${min} min registrados, ${fim.pausas} pausa${fim.pausas === 1 ? "" : "s"}.`,
    );
    if (completo) notificar("Pomodoro completo! Sessão registrada.");
    setSessao(null);
    setIntervaloFim(null);
    setAnotacao("");
  }

  async function encerrar() {
    if (ocupado.current || !sessao) return;
    ocupado.current = true;
    setErro("");
    try {
      mostrarResumo(await encerrarSessao(sessao.id, anotacao));
    } catch (e) {
      setErro(mensagemDoErro(e));
      await ressincronizar();
    } finally {
      ocupado.current = false;
    }
  }

  // ---------- Tela ----------
  const porcentagem = ehPomodoro ? Math.min(100, Math.round((noBloco / focoSeg) * 100)) : null;
  const pausada = sessao?.estado === "pausada";
  const labelFase = emIntervalo ? "Intervalo" : pausada ? "Pausado" : "Foco";

  return (
    <div className="temporizador-page">
      <h1 className="temporizador-titulo">Temporizador</h1>

      {/* Seletor de técnica */}
      <div className="tecnica-selector">
        {Object.values(TECNICA_TEMPO).map((t) => (
          <button
            key={t}
            className={`tecnica-btn ${tecnicaAtual === t ? "ativo" : ""}`}
            onClick={() => setTecnica(t)}
            disabled={!!sessao}
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
          disabled={!!sessao}
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

      {/* Configuração do Pomodoro */}
      {!sessao && tecnica === TECNICA_TEMPO.POMODORO && (
        <div className="pomodoro-config">
          <label>
            Foco (min)
            <input type="number" min="1" max="180" value={foco}
              onChange={(e) => setFoco(Number(e.target.value))} />
          </label>
          <label>
            Intervalo (min)
            <input type="number" min="1" max="60" value={intervalo}
              onChange={(e) => setIntervalo(Number(e.target.value))} />
          </label>
          <label>
            Blocos
            <input type="number" min="1" max="20" value={blocos}
              onChange={(e) => setBlocos(Number(e.target.value))} />
          </label>
        </div>
      )}

      {/* Display do timer */}
      <div className="timer-display">
        {ehPomodoro ? (
          <>
            <div className="fase-label">{labelFase}</div>
            <div className="timer-relogio">
              {formatarTempo(
                emIntervalo ? restanteIntervalo : sessao ? restante : foco * 60,
              )}
            </div>
            {sessao && (
              <div className="ciclo-label">
                Bloco {Math.min(blocosFeitos + 1, sessao.blocos_planejados)} de {sessao.blocos_planejados}
              </div>
            )}
            <div className="progresso-bar">
              <div className="progresso-fill" style={{ width: `${emIntervalo ? 0 : porcentagem || 0}%` }} />
            </div>
          </>
        ) : (
          <>
            <div className="fase-label">{pausada ? "Pausado" : TECNICA_LABEL[tecnicaAtual] || tecnicaAtual}</div>
            <div className="timer-relogio">{formatarTempo(decorrido)}</div>
          </>
        )}
        {sessao && (
          <div className="sessao-info">
            Pausas: {sessao.pausas} · Tempo estudado: {formatarTempo(decorrido)}
          </div>
        )}
      </div>

      {/* Anotação */}
      {sessao && (
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
        {!sessao ? (
          <button className="btn-iniciar" onClick={iniciar}>
            Iniciar
          </button>
        ) : (
          <>
            {emIntervalo ? (
              <button className="btn-pausar" onClick={() => retomar(false)}>
                Pular intervalo
              </button>
            ) : rodando ? (
              <button className="btn-pausar" onClick={pausar}>
                Pausar
              </button>
            ) : (
              <button className="btn-pausar" onClick={() => retomar(false)}>
                Retomar
              </button>
            )}
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