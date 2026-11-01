// ============================================================
// PAGE - Área 3: Metas
// Study+
// ============================================================

import React, { useState, useEffect } from "react";
import { TIPO_META } from "../../Utils/constants";
import {
  listarMetas,
  criarMeta,
  atualizarMeta,
  excluirMeta,
  buscarProgressoMeta,
} from "../../Controllers/metaController";
import "./Metas.css";
import { disciplinaService } from "../../Services/disciplinaService";
import { formatarData, formatarHorario } from "../../Utils/formatters";

const metaVazia = {
  disciplina: "",
  carga_horaria_alvo: "",
  data_inicio: "",
  data_fim: "",
  tipo: TIPO_META.HORAS,
};

export default function Metas() {
  const [metas, setMetas] = useState([]);
  const [progressos, setProgressos] = useState({});
  const [form, setForm] = useState(metaVazia);
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
    carregarMetas();
  }, []);

  async function carregarMetas() {
    const data = await listarMetas();
    setMetas(data);
    const progs = {};
    for (const meta of data) {
      const p = await buscarProgressoMeta(meta.id);
      progs[meta.id] = p.percentual;
    }
    setProgressos(progs);
  }

  function abrirFormNovo() {
    setForm(metaVazia);
    setEditandoId(null);
    setErro("");
    setMostrarForm(true);
  }

  function abrirFormEdicao(meta) {
    setForm({
      disciplina: meta.disciplina,
      carga_horaria_alvo: meta.carga_horaria_alvo,
      data_inicio: meta.data_inicio,
      data_fim: meta.data_fim,
      tipo: meta.tipo,
    });
    setEditandoId(meta.id);
    setErro("");
    setMostrarForm(true);
  }

  function cancelar() {
    setMostrarForm(false);
    setErro("");
    setForm(metaVazia);
    setEditandoId(null);
  }

  async function salvar() {
    setErro("");
    try {
      if (editandoId) {
        await atualizarMeta(editandoId, form);
        setMensagem("Meta atualizada com sucesso!");
      } else {
        await criarMeta(form);
        setMensagem("Meta criada com sucesso!");
      }
      setMostrarForm(false);
      setEditandoId(null);
      setForm(metaVazia);
      await carregarMetas();
      setTimeout(() => setMensagem(""), 3000);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function excluir(id) {
    if (!window.confirm("Excluir esta meta?")) return;
    await excluirMeta(id);
    setMensagem("Meta excluída.");
    await carregarMetas();
    setTimeout(() => setMensagem(""), 3000);
  }

  return (
    <div className="metas-page">
      <div className="metas-header">
        <h1 className="metas-titulo">Metas de Estudo</h1>
        <button className="btn-nova-meta" onClick={abrirFormNovo}>
          + Nova Meta
        </button>
      </div>

      {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}

      {/* Formulário */}
      {mostrarForm && (
        <div className="meta-form-container">
          <h2>{editandoId ? "Editar Meta" : "Nova Meta"}</h2>

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

          <div className="form-grupo">
            <label>Tipo de meta</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <option value={TIPO_META.HORAS}>Horas estudadas</option>
              <option value={TIPO_META.TAREFAS}>Tarefas concluídas</option>
            </select>
          </div>

          <div className="form-grupo">
            <label>Carga horária alvo (horas)</label>
            <input
              type="number"
              min="1"
              value={form.carga_horaria_alvo}
              onChange={(e) =>
                setForm({ ...form, carga_horaria_alvo: Number(e.target.value) })
              }
            />
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

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="form-acoes">
            <button className="btn-salvar" onClick={salvar}>
              {editandoId ? "Salvar alterações" : "Criar meta"}
            </button>
            <button className="btn-cancelar" onClick={cancelar}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de metas */}
      {metas.length === 0 ? (
        <div className="metas-vazio">
          <p>Nenhuma meta cadastrada ainda.</p>
          <p>Crie sua primeira meta de estudo!</p>
        </div>
      ) : (
        <div className="metas-lista">
          {metas.map((meta) => {
            const percentual = progressos[meta.id] ?? 0;
            return (
              <div key={meta.id} className="meta-card">
                <div className="meta-card-header">
                  <span className="meta-disciplina">{meta.disciplina}</span>
                  <span className={`meta-tipo ${meta.tipo}`}>
                    {meta.tipo === TIPO_META.HORAS ? "Horas" : "Tarefas"}
                  </span>
                </div>

                <div className="meta-info">
                  <span>Alvo: {meta.carga_horaria_alvo}h</span>
                  <span>
                    {formatarData(meta.data_inicio)} →{" "}
                    {formatarData(meta.data_fim)}
                  </span>
                </div>

                <div className="meta-progresso">
                  <div className="progresso-topo">
                    <span>Progresso</span>
                    <span className="percentual">{percentual}%</span>
                  </div>
                  <div className="progresso-bar">
                    <div
                      className="progresso-fill"
                      style={{
                        width: `${percentual}%`,
                        background:
                          percentual >= 100
                            ? "#22c55e"
                            : percentual >= 50
                              ? "#f59e0b"
                              : "#6366f1",
                      }}
                    />
                  </div>
                </div>

                <div className="meta-acoes">
                  <button
                    className="btn-editar"
                    onClick={() => abrirFormEdicao(meta)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-excluir"
                    onClick={() => excluir(meta.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}