const MetaModel = require("../entidades/metaModel");
const ErroNegocio = require("./ErroNegocio");

const arredondar = (n) => Math.round(n * 100) / 100;

function validar(m) {
  if (!m.disciplina || !m.carga_horaria_alvo || !m.data_inicio || !m.data_fim || !m.tipo)
    throw new ErroNegocio(400, "Todos os campos são obrigatórios.");
  if (!(Number(m.carga_horaria_alvo) > 0))
    throw new ErroNegocio(400, "A carga horária alvo deve ser maior que zero.");
  if (m.data_fim < m.data_inicio)
    throw new ErroNegocio(400, "A data de fim não pode ser anterior à data de início.");
}

async function horasDaMeta(usuarioId, meta) {
  const minutos = await MetaModel.minutosEstudados(
    usuarioId, meta.disciplina, meta.data_inicio, meta.data_fim
  );
  return minutos / 60;
}

function calcularPercentual(horas, alvo) {
  if (!alvo || Number(alvo) <= 0) return 0;
  return Math.min(100, Math.round((horas / Number(alvo)) * 1000) / 10);
}

async function buscarOuFalhar(id, usuarioId) {
  const meta = await MetaModel.buscarPorId(id, usuarioId);
  if (!meta) throw new ErroNegocio(404, "Meta não encontrada.");
  return meta;
}

async function comHoras(usuarioId, meta) {
  return { ...meta, horas_cumpridas: arredondar(await horasDaMeta(usuarioId, meta)) };
}

async function listar(usuarioId) {
  const metas = await MetaModel.listar(usuarioId);
  return Promise.all(metas.map((m) => comHoras(usuarioId, m)));
}

async function buscar(id, usuarioId) {
  return comHoras(usuarioId, await buscarOuFalhar(id, usuarioId));
}

async function criar(usuarioId, dados) {
  validar(dados);
  return MetaModel.criar(usuarioId, dados);
}

async function atualizar(id, usuarioId, dados) {
  await buscarOuFalhar(id, usuarioId);
  validar(dados);
  return MetaModel.atualizar(id, usuarioId, dados);
}

async function excluir(id, usuarioId) {
  await buscarOuFalhar(id, usuarioId);
  await MetaModel.excluir(id, usuarioId);
  return { success: true };
}

async function obterProgresso(id, usuarioId) {
  const meta = await buscarOuFalhar(id, usuarioId);
  const horas = await horasDaMeta(usuarioId, meta);
  return {
    percentual: calcularPercentual(horas, meta.carga_horaria_alvo),
    meta: { ...meta, horas_cumpridas: arredondar(horas) },
  };
}

module.exports = { listar, buscar, criar, atualizar, excluir, obterProgresso, calcularPercentual };