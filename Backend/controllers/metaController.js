const MetaService = require("../models/regras_negocio/MetaService");

const listarMetas = async (req, res) => {
  res.json(await MetaService.listar(req.usuarioId));
};

const buscarMeta = async (req, res) => {
  res.json(await MetaService.buscar(req.params.id, req.usuarioId));
};

const criarMeta = async (req, res) => {
  res.status(201).json(await MetaService.criar(req.usuarioId, req.body));
};

const atualizarMeta = async (req, res) => {
  res.json(await MetaService.atualizar(req.params.id, req.usuarioId, req.body));
};

const excluirMeta = async (req, res) => {
  res.json(await MetaService.excluir(req.params.id, req.usuarioId));
};

const progressoMeta = async (req, res) => {
  res.json(await MetaService.obterProgresso(req.params.id, req.usuarioId));
};

module.exports = { listarMetas, buscarMeta, criarMeta, atualizarMeta, excluirMeta, progressoMeta };