// ============================================================
// PAGE - Área 3: Planejamento (Cronogramas)
// Study+
// ============================================================

import React, { useState, useEffect } from "react";
import {
  listarCronogramas,
  criarCronograma,
  atualizarCronograma,
  excluirCronograma,
} from "../../Controllers/estudoController";
import "./Planejamento.css";
import { disciplinaService } from "../../Services/disciplinaService";
import { formatarData, formatarHorario } from "../../Utils/formatters";

const RECORRENCIAS = [
  { valor: "nenhuma", label: "Sem recorrência" },
  { valor: "diaria", label: "Diária" },
  { valor: "semanal", label: "Semanal" },
];

const formVazio = {
  disciplina: "",
  data_inicio: "",
  data_fim: "",
  horario_inicio: "",
  horario_fim: "",
  recorrencia: "nenhuma",
};

export default function Planejamento() {
  const [cronogramas, setCronogramas] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);

  useEffect(() => {
    disciplinaService
      .listar()
      .then(setDisciplinas)
      .catch(() => {});
  }, []);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const data = await listarCronogramas();
    setCronogramas(data);
  }

  function abrirFormNovo() {
    setForm(formVazio);
    setEditandoId(null);
    setErro("");
    setMostrarForm(true);
  }

  function abrirFormEdicao(c) {
    setForm({
      disciplina: c.disciplina,
      data_inicio: c.data_inicio,
      data_fim: c.data_fim,
      horario_inicio: c.horario_inicio,
      horario_fim: c.horario_fim,
      recorrencia: c.recorrencia ?? "nenhuma",
    });
    setEditandoId(c.id);
    setErro("");
    setMostrarForm(true);
  }

  function cancelar() {
    setMostrarForm(false);
    setErro("");
    setForm(formVazio);
    setEditandoId(null);
  }

  async function salvar() {
    setErro("");
    try {
      if (editandoId) {
        await atualizarCronograma(editandoId, form);
        setMensagem("Cronograma atualizado!");
      } else {
        await criarCronograma(form);
        setMensagem("Cronograma criado!");
      }
      setMostrarForm(false);
      setEditandoId(null);
      setForm(formVazio);
      await carregar();
      setTimeout(() => setMensagem(""), 3000);
    } catch (e) {
      setErro(e.response?.data?.message || e.message);
    }
  }

  async function excluir(id) {
    if (!window.confirm("Excluir este cronograma?")) return;
    await excluirCronograma(id);
    setMensagem("Cronograma excluído.");
    await carregar();
    setTimeout(() => setMensagem(""), 3000);
  }

  return (
    <div className="planejamento-page">
      <div className="planejamento-header">
        <h1 className="planejamento-titulo">Planejamento</h1>
        <button className="btn-novo" onClick={abrirFormNovo}>
          + Novo Cronograma
        </button>
      </div>

      {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}

      {/* Formulário */}
      {mostrarForm && (
        <div className="plano-form-container">
          <h2>{editandoId ? "Editar Cronograma" : "Novo Cronograma"}</h2>

          <div className="form-grupo">
            <label>Disciplina</label>
            <select
              value={form.disciplina}
              onChange={(e) => setForm({ ...form, disciplina: e.target.value })}
            >
              <option value="">Selecione</option>
              {disciplinas.map((d) => (
                <option key={d.id} value={d.nome}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-linha">
            <div className="form-grupo">
              <label>Data início</label>
              <input
                type="date"
                value={form.data_inicio}
                onChange={(e) =>
                  setForm({ ...form, data_inicio: e.target.value })
                }
              />
            </div>
            <div className="form-grupo">
              <label>Data fim</label>
              <input
                type="date"
                value={form.data_fim}
                onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
              />
            </div>
          </div>

          <div className="form-linha">
            <div className="form-grupo">
              <label>Horário início</label>
              <input
                type="time"
                value={form.horario_inicio}
                onChange={(e) =>
                  setForm({ ...form, horario_inicio: e.target.value })
                }
              />
            </div>
            <div className="form-grupo">
              <label>Horário fim</label>
              <input
                type="time"
                value={form.horario_fim}
                onChange={(e) =>
                  setForm({ ...form, horario_fim: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-grupo">
            <label>Recorrência</label>
            <select
              value={form.recorrencia}
              onChange={(e) =>
                setForm({ ...form, recorrencia: e.target.value })
              }
            >
              {RECORRENCIAS.map((r) => (
                <option key={r.valor} value={r.valor}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="form-acoes">
            <button className="btn-salvar" onClick={salvar}>
              {editandoId ? "Salvar alterações" : "Criar cronograma"}
            </button>
            <button className="btn-cancelar" onClick={cancelar}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {cronogramas.length === 0 ? (
        <div className="planejamento-vazio">
          <p>Nenhum cronograma cadastrado ainda.</p>
          <p>Crie seu primeiro cronograma de estudo!</p>
        </div>
      ) : (
        <div className="cronogramas-lista">
          {cronogramas.map((c) => (
            <div key={c.id} className="cronograma-card">
              <div className="cronograma-header">
                <span className="cronograma-disciplina">{c.disciplina}</span>
                <span
                  className={`cronograma-recorrencia rec-${c.recorrencia ?? "nenhuma"}`}
                >
                  {
                    RECORRENCIAS.find(
                      (r) => r.valor === (c.recorrencia ?? "nenhuma"),
                    )?.label
                  }
                </span>
              </div>
              <div className="cronograma-info">
                <span>📅 {formatarData(c.data_inicio || c.data)} → {formatarData(c.data_fim || c.data)}</span>
                <span>🕐 {formatarHorario(c.horario_inicio || c.hora_inicio)} → {formatarHorario(c.horario_fim || c.hora_fim)}</span>
              </div>
              <div className="cronograma-acoes">
                <button
                  className="btn-editar"
                  onClick={() => abrirFormEdicao(c)}
                >
                  Editar
                </button>
                <button className="btn-excluir" onClick={() => excluir(c.id)}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}