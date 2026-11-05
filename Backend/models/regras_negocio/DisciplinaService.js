const DisciplinaModel = require("../entidades/DisciplinaModel");
const ErroNegocio = require("./ErroNegocio");

const NOME_MAX = 100;
const DESCRICAO_MAX = 255;

const texto = (v) => String(v ?? "").trim();
const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;

function validar(d) {
  const nome = texto(d.nome);
  if (!nome) throw new ErroNegocio(400, "O nome da disciplina é obrigatório.");
  if (nome.length > NOME_MAX)
    throw new ErroNegocio(400, `O nome deve ter no máximo ${NOME_MAX} caracteres.`);
  const descricao = texto(d.descricao);
  if (descricao.length > DESCRICAO_MAX)
    throw new ErroNegocio(400, `A descrição deve ter no máximo ${DESCRICAO_MAX} caracteres.`);
  return { nome, descricao };
}

async function buscarOuFalhar(id, usuarioId) {
  const d = await DisciplinaModel.buscarPorId(Number(id), usuarioId);
  if (!d) throw new ErroNegocio(404, "Disciplina não encontrada.");
  return d;
}

async function listar(usuarioId) {
  return DisciplinaModel.listarComVinculos(usuarioId);
}

async function criar(usuarioId, dados) {
  const { nome, descricao } = validar(dados);
  if (await DisciplinaModel.nomeEmUso(nome, usuarioId))
    throw new ErroNegocio(409, "Já existe uma disciplina com esse nome.");
  const id = await DisciplinaModel.inserir(usuarioId, nome, descricao);
  return { id, nome, descricao };
}

async function atualizar(id, usuarioId, dados) {
  const atual = await buscarOuFalhar(id, usuarioId);
  const { nome, descricao } = validar({
    nome: dados.nome ?? atual.nome,
    descricao: dados.descricao ?? atual.descricao,
  });
  if (await DisciplinaModel.nomeEmUso(nome, usuarioId, atual.id))
    throw new ErroNegocio(409, "Já existe uma disciplina com esse nome.");

  await DisciplinaModel.atualizarDados(atual.id, usuarioId, nome, descricao);
  if (nome !== atual.nome) await DisciplinaModel.propagarNome(usuarioId, atual.nome, nome);
  return { id: atual.id, nome, descricao };
}

async function excluir(id, usuarioId) {
  const d = await buscarOuFalhar(id, usuarioId);
  const v = await DisciplinaModel.contarVinculos(d.id, d.nome, usuarioId);

  const partes = [];
  if (v.tarefas) partes.push(plural(v.tarefas, "tarefa", "tarefas"));
  if (v.cronogramas) partes.push(plural(v.cronogramas, "cronograma", "cronogramas"));
  if (v.metas) partes.push(plural(v.metas, "meta", "metas"));
  if (partes.length)
    throw new ErroNegocio(
      409,
      `Não é possível excluir "${d.nome}": há ${partes.join(", ")} vinculado(s) a ela. Remova esses itens ou troque a disciplina deles antes.`
    );

  await DisciplinaModel.removerPorId(d.id, usuarioId);
  return { mensagem: "Disciplina excluída com sucesso." };
}

module.exports = { listar, criar, atualizar, excluir };