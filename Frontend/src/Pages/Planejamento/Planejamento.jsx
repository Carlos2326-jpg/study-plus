import React, { useState, useEffect } from "react";
import {
  listarCronogramas,
  criarCronograma,
  atualizarCronograma,
  excluirCronograma,
} from "../../Controllers/estudoController";
import "../../Assets/Styles/Pages/Planejamento.css";
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

const mensagemDoErro = (e) => e?.response?.data?.message || e?.message || "Erro inesperado.";

// Quantas ocorrências o período vai gerar (só para avisar o usuário)
function contarOcorrencias({ data_inicio, data_fim, recorrencia }) {
  if (recorrencia === "nenhuma") return 1;
  if (!data_inicio || !data_fim || data_fim < data_inicio) return 0;
  const dias = Math.round(
    (new Date(`${data_fim}T00:00:00`) - new Date(`${data_inicio}T00:00:00`)) / 86400000,
  );
  return recorrencia === "diaria" ? dias + 1 : Math.floor(dias / 7) + 1;
}

export default function Planejamento() {
  const [cronogramas, setCronogramas] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);

  useEffect(() => {
    disciplinaService.listar().then(setDisciplinas).catch(() => {});
    carregar();
  }, []);

  async function carregar() {
    try {
      setCronogramas(await listarCronogramas());
    } catch (e) {
      setErro(mensagemDoErro(e));
    }
  }

  function avisar(texto) {
    setMensagem(texto);
    setTimeout(() => setMensagem(""), 3000);
  }

  function abrirFormNovo() {
    setForm(formVazio);
    setEditandoId(null);
    setErro("");
    setMostrarForm(true);
  }

  function abrirFormEdicao(c) {
    setForm({
      disciplina: c.disciplina ?? "",
      data_inicio: c.data,
      data_fim: c.data,
      horario_inicio: formatarHorario(c.hora_inicio),
      horario_fim: formatarHorario(c.hora_fim),
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
        // Editar altera só esta ocorrência (uma data)
        await atualizarCronograma(editandoId, {
          disciplina: form.disciplina,
          data_inicio: form.data_inicio,
          data_fim: form.data_inicio,
          horario_inicio: form.horario_inicio,
          horario_fim: form.horario_fim,
        });
        avisar("Cronograma atualizado!");
      } else {
        if (form.recorrencia !== "nenhuma" && !form.data_fim) {
          setErro("Informe a data de fim da recorrência.");
          return;
        }
        const r = await criarCronograma({
          ...form,
          data_fim: form.recorrencia === "nenhuma" ? form.data_inicio : form.data_fim,
        });
        avisar(r?.ocorrencias > 1 ? `${r.ocorrencias} cronogramas criados!` : "Cronograma criado!");
      }
      cancelar();
      await carregar();
    } catch (e) {
      setErro(mensagemDoErro(e));
    }
  }

  async function excluir(c, serie = false) {
    const texto = serie
      ? "Excluir TODAS as ocorrências desta série?"
      : "Excluir este cronograma?";
    if (!window.confirm(texto)) return;
    try {
      await excluirCronograma(c.id, serie);
      avisar(serie ? "Série excluída." : "Cronograma excluído.");
      await carregar();
    } catch (e) {
      setErro(mensagemDoErro(e));
    }
  }

  // Quantas ocorrências cada série tem
  const tamanhoSerie = {};
  cronogramas.forEach((c) => {
    if (c.serie_id) tamanhoSerie[c.serie_id] = (tamanhoSerie[c.serie_id] || 0) + 1;
  });

  const previa = !editandoId ? contarOcorrencias(form) : 1;

  return (
    <div className="planejamento-page">
      <div className="planejamento-header">
        <h1 className="planejamento-titulo">Planejamento</h1>
        <button className="btn-novo" onClick={abrirFormNovo}>
          + Novo Cronograma
        </button>
      </div>

      {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}
      {erro && !mostrarForm && <p className="mensagem-erro">{erro}</p>}

      {/* Formulário */}
      {mostrarForm && (
        <div className="plano-form-container">
          <h2>{editandoId ? "Editar ocorrência" : "Novo Cronograma"}</h2>

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
              <label>{editandoId ? "Data" : "Data início"}</label>
              <input
                type="date"
                value={form.data_inicio}
                onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
              />
            </div>
            {!editandoId && (
              <div className="form-grupo">
                <label>Data fim (para recorrência)</label>
                <input
                  type="date"
                  value={form.data_fim}
                  disabled={form.recorrencia === "nenhuma"}
                  onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="form-linha">
            <div className="form-grupo">
              <label>Horário início</label>
              <input
                type="time"
                value={form.horario_inicio}
                onChange={(e) => setForm({ ...form, horario_inicio: e.target.value })}
              />
            </div>
            <div className="form-grupo">
              <label>Horário fim</label>
              <input
                type="time"
                value={form.horario_fim}
                onChange={(e) => setForm({ ...form, horario_fim: e.target.value })}
              />
            </div>
          </div>

          {!editandoId && (
            <div className="form-grupo">
              <label>Recorrência</label>
              <select
                value={form.recorrencia}
                onChange={(e) =>
                  setForm({
                    ...form,
                    recorrencia: e.target.value,
                    data_fim: e.target.value === "nenhuma" ? "" : form.data_fim,
                  })
                }
              >
                {RECORRENCIAS.map((r) => (
                  <option key={r.valor} value={r.valor}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!editandoId && form.recorrencia !== "nenhuma" && (
            <p className="plano-dica">
              {previa > 0
                ? `Serão criados ${previa} cronograma${previa === 1 ? "" : "s"}, um por data.`
                : "Informe a data de fim (igual ou posterior à de início)."}
            </p>
          )}
          {editandoId && (
            <p className="plano-dica">Esta edição altera apenas este dia.</p>
          )}

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

      {/* Lista: um card por data */}
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
                <span className="cronograma-disciplina">{c.disciplina || "Sem disciplina"}</span>
                <span className={`cronograma-recorrencia rec-${c.recorrencia ?? "nenhuma"}`}>
                  {RECORRENCIAS.find((r) => r.valor === (c.recorrencia ?? "nenhuma"))?.label}
                </span>
              </div>
              <div className="cronograma-info">
                <span>📅 {formatarData(c.data)}</span>
                <span>
                  🕐 {formatarHorario(c.hora_inicio)} → {formatarHorario(c.hora_fim)}
                </span>
                {c.serie_id && (
                  <span className="cronograma-serie">🔁 Série de {tamanhoSerie[c.serie_id]}</span>
                )}
              </div>
              <div className="cronograma-acoes">
                <button className="btn-editar" onClick={() => abrirFormEdicao(c)}>
                  Editar
                </button>
                <button className="btn-excluir" onClick={() => excluir(c)}>
                  Excluir
                </button>
                {c.serie_id && tamanhoSerie[c.serie_id] > 1 && (
                  <button className="btn-excluir" onClick={() => excluir(c, true)}>
                    Excluir série
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}