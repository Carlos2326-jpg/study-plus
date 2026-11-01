const TarefaModel = require("../models/entidades/tarefaModel.js");
const SubtarefaModel = require("../models/entidades/subtarefaModel.js");

const falha = (res, msg, err) => {
  console.error(msg, err.message);
  res.status(500).json({ erro: msg, detalhe: err.message });
};
const naoEncontrada = (res, msg) => res.status(404).json({ erro: msg });

// TAREFAS
const listarTarefas = async (req, res) => {
  try {
    res.json(await TarefaModel.listar(req.usuarioId, req.query));
  } catch (err) { falha(res, "Erro ao listar tarefas.", err); }
};

const buscarTarefa = async (req, res) => {
  try {
    const tarefa = await TarefaModel.buscarPorId(req.params.id, req.usuarioId);
    if (!tarefa) return naoEncontrada(res, "Tarefa não encontrada.");
    res.json(tarefa);
  } catch (err) { falha(res, "Erro ao buscar tarefa.", err); }
};

const criarTarefa = async (req, res) => {
  try {
    if (!req.body.titulo) return res.status(400).json({ erro: "Título é obrigatório." });
    const tarefa = await TarefaModel.criar({ ...req.body, usuario_id: req.usuarioId });
    res.status(201).json(tarefa);
  } catch (err) { falha(res, "Erro ao criar tarefa.", err); }
};

const atualizarTarefa = async (req, res) => {
  try {
    const existente = await TarefaModel.buscarPorId(req.params.id, req.usuarioId);
    if (!existente) return naoEncontrada(res, "Tarefa não encontrada.");
    res.json(await TarefaModel.atualizar(req.params.id, req.body));
  } catch (err) { falha(res, "Erro ao atualizar tarefa.", err); }
};

const excluirTarefa = async (req, res) => {
  try {
    const existente = await TarefaModel.buscarPorId(req.params.id, req.usuarioId);
    if (!existente) return naoEncontrada(res, "Tarefa não encontrada.");
    await TarefaModel.excluir(req.params.id);
    res.json({ mensagem: "Tarefa excluída com sucesso." });
  } catch (err) { falha(res, "Erro ao excluir tarefa.", err); }
};

// SUBTAREFAS
const listarSubtarefas = async (req, res) => {
  try {
    const tarefa = await TarefaModel.buscarPorId(req.params.id, req.usuarioId);
    if (!tarefa) return naoEncontrada(res, "Tarefa não encontrada.");
    res.json(await SubtarefaModel.listarPorTarefa(req.params.id));
  } catch (err) { falha(res, "Erro ao listar subtarefas.", err); }
};

const criarSubtarefa = async (req, res) => {
  try {
    if (!req.body.titulo) return res.status(400).json({ erro: "Título é obrigatório." });
    const tarefa = await TarefaModel.buscarPorId(req.params.id, req.usuarioId);
    if (!tarefa) return naoEncontrada(res, "Tarefa não encontrada.");
    const subtarefa = await SubtarefaModel.criar(req.params.id, req.body.titulo);
    res.status(201).json(subtarefa);
  } catch (err) { falha(res, "Erro ao criar subtarefa.", err); }
};

const atualizarSubtarefa = async (req, res) => {
  try {
    const existente = await SubtarefaModel.buscarPorId(req.params.id, req.usuarioId);
    if (!existente) return naoEncontrada(res, "Subtarefa não encontrada.");
    res.json(await SubtarefaModel.atualizar(req.params.id, req.body));
  } catch (err) { falha(res, "Erro ao atualizar subtarefa.", err); }
};

const excluirSubtarefa = async (req, res) => {
  try {
    const existente = await SubtarefaModel.buscarPorId(req.params.id, req.usuarioId);
    if (!existente) return naoEncontrada(res, "Subtarefa não encontrada.");
    await SubtarefaModel.excluir(req.params.id);
    res.json({ mensagem: "Subtarefa excluída com sucesso." });
  } catch (err) { falha(res, "Erro ao excluir subtarefa.", err); }
};

module.exports = {
  listarTarefas, buscarTarefa, criarTarefa, atualizarTarefa, excluirTarefa,
  listarSubtarefas, criarSubtarefa, atualizarSubtarefa, excluirSubtarefa,
};