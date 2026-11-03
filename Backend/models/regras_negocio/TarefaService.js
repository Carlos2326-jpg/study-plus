const TarefaModel = require("../entidades/tarefaModel");
const SubtarefaModel = require("../entidades/subtarefaModel");
const DisciplinaModel = require("../entidades/disciplinaModel");
const ErroNegocio = require("./ErroNegocio");

const PRIORIDADES = ["baixa", "media", "alta"];
const ESTADOS = ["pendente", "em_andamento", "concluida", "bloqueada"];
const TITULO_MAX = 100;

const vazio = (v) => v === undefined || v === null || v === "";

function textoData(v) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

// Valida e padroniza os dados de uma tarefa
async function normalizar(usuarioId, d) {
  const titulo = String(d.titulo ?? "").trim();
  if (!titulo) throw new ErroNegocio(400, "Título é obrigatório.");
  if (titulo.length > TITULO_MAX)
    throw new ErroNegocio(400, `O título deve ter no máximo ${TITULO_MAX} caracteres.`);

  const prioridade = vazio(d.prioridade) ? "media" : String(d.prioridade).toLowerCase();
  if (!PRIORIDADES.includes(prioridade)) throw new ErroNegocio(400, "Prioridade inválida.");

  const status = vazio(d.status) ? "pendente" : String(d.status).toLowerCase();
  if (!ESTADOS.includes(status)) throw new ErroNegocio(400, "Estado inválido.");

  let prazo = null;
  if (!vazio(d.prazo)) {
    prazo = textoData(d.prazo);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(prazo)) throw new ErroNegocio(400, "Prazo inválido.");
  }

  let disciplina_id = null;
  if (!vazio(d.disciplina_id)) {
    disciplina_id = Number(d.disciplina_id);
    const valida =
      Number.isInteger(disciplina_id) &&
      (await DisciplinaModel.buscarPorId(disciplina_id, usuarioId));
    if (!valida) throw new ErroNegocio(400, "Disciplina inválida.");
  }

  return { titulo, prioridade, status, prazo, disciplina_id };
}

// Progresso (0 a 100) pelas subtarefas concluídas
function calcularProgresso(tarefa, resumo) {
  if (tarefa.status === "concluida") return 100;
  if (!resumo || resumo.total === 0) return 0;
  return Math.round((resumo.feitas / resumo.total) * 100);
}

async function comProgresso(tarefas) {
  const mapa = await SubtarefaModel.resumoPorTarefas(tarefas.map((t) => t.id));
  return tarefas.map((t) => ({ ...t, progresso: calcularProgresso(t, mapa[t.id]) }));
}

async function buscarOuFalhar(id, usuarioId) {
  const tarefa = await TarefaModel.buscarPorId(id, usuarioId);
  if (!tarefa) throw new ErroNegocio(404, "Tarefa não encontrada.");
  return tarefa;
}

// ---------- Tarefas ----------
async function listar(usuarioId, filtros) {
  return comProgresso(await TarefaModel.listar(usuarioId, filtros));
}

async function buscar(id, usuarioId) {
  const [tarefa] = await comProgresso([await buscarOuFalhar(id, usuarioId)]);
  return tarefa;
}

async function criar(usuarioId, dados) {
  const t = await normalizar(usuarioId, dados);
  const criada = await TarefaModel.criar({ ...t, usuario_id: usuarioId });
  return { ...criada, progresso: t.status === "concluida" ? 100 : 0 };
}

async function atualizar(id, usuarioId, dados) {
  const existente = await buscarOuFalhar(id, usuarioId);
  // Mistura com o que já existe: permite atualizar só alguns campos
  const t = await normalizar(usuarioId, { ...existente, ...dados });
  const atualizada = await TarefaModel.atualizar(id, t);
  const [comProg] = await comProgresso([{ ...existente, ...t, id: Number(id) }]);
  return { ...atualizada, progresso: comProg.progresso };
}

async function excluir(id, usuarioId) {
  await buscarOuFalhar(id, usuarioId);
  await TarefaModel.excluir(id);
  return { mensagem: "Tarefa excluída com sucesso." };
}

// ---------- Subtarefas ----------
function validarTituloSubtarefa(titulo) {
  const t = String(titulo ?? "").trim();
  if (!t) throw new ErroNegocio(400, "Título é obrigatório.");
  if (t.length > TITULO_MAX)
    throw new ErroNegocio(400, `O título deve ter no máximo ${TITULO_MAX} caracteres.`);
  return t;
}

const comoBooleano = (v) => v === true || v === 1 || v === "1" || v === "true";

async function listarSubtarefas(tarefaId, usuarioId) {
  await buscarOuFalhar(tarefaId, usuarioId);
  return SubtarefaModel.listarPorTarefa(tarefaId);
}

async function criarSubtarefa(tarefaId, usuarioId, dados) {
  const titulo = validarTituloSubtarefa(dados.titulo);
  await buscarOuFalhar(tarefaId, usuarioId);
  return SubtarefaModel.criar(tarefaId, titulo);
}

async function atualizarSubtarefa(id, usuarioId, dados) {
  const existente = await SubtarefaModel.buscarPorId(id, usuarioId);
  if (!existente) throw new ErroNegocio(404, "Subtarefa não encontrada.");

  const titulo = validarTituloSubtarefa(dados.titulo ?? existente.titulo);
  const concluida = comoBooleano(dados.concluida ?? existente.concluida);
  return SubtarefaModel.atualizar(id, { titulo, concluida });
}

async function excluirSubtarefa(id, usuarioId) {
  const existente = await SubtarefaModel.buscarPorId(id, usuarioId);
  if (!existente) throw new ErroNegocio(404, "Subtarefa não encontrada.");
  await SubtarefaModel.excluir(id);
  return { mensagem: "Subtarefa excluída com sucesso." };
}

module.exports = {
  listar, buscar, criar, atualizar, excluir,
  listarSubtarefas, criarSubtarefa, atualizarSubtarefa, excluirSubtarefa,
};