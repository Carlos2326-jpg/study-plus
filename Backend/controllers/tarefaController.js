const TarefaService = require("../models/regras_negocio/TarefaService");

const listarTarefas = async (req, res) => {
  res.json(await TarefaService.listar(req.usuarioId, req.query));
};

const buscarTarefa = async (req, res) => {
  res.json(await TarefaService.buscar(req.params.id, req.usuarioId));
};

const criarTarefa = async (req, res) => {
  res.status(201).json(await TarefaService.criar(req.usuarioId, req.body));
};

const atualizarTarefa = async (req, res) => {
  res.json(await TarefaService.atualizar(req.params.id, req.usuarioId, req.body));
};

const excluirTarefa = async (req, res) => {
  res.json(await TarefaService.excluir(req.params.id, req.usuarioId));
};

const listarSubtarefas = async (req, res) => {
  res.json(await TarefaService.listarSubtarefas(req.params.id, req.usuarioId));
};

const criarSubtarefa = async (req, res) => {
  res.status(201).json(await TarefaService.criarSubtarefa(req.params.id, req.usuarioId, req.body));
};

const atualizarSubtarefa = async (req, res) => {
  res.json(await TarefaService.atualizarSubtarefa(req.params.id, req.usuarioId, req.body));
};

const excluirSubtarefa = async (req, res) => {
  res.json(await TarefaService.excluirSubtarefa(req.params.id, req.usuarioId));
};

module.exports = {
  listarTarefas, buscarTarefa, criarTarefa, atualizarTarefa, excluirTarefa,
  listarSubtarefas, criarSubtarefa, atualizarSubtarefa, excluirSubtarefa,
};