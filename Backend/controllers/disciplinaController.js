const DisciplinaService = require("../models/regras_negocio/DisciplinaService");

const listar = async (req, res) => {
  res.json(await DisciplinaService.listar(req.usuarioId));
};

const criar = async (req, res) => {
  res.status(201).json(await DisciplinaService.criar(req.usuarioId, req.body));
};

const atualizar = async (req, res) => {
  res.json(await DisciplinaService.atualizar(req.params.id, req.usuarioId, req.body));
};

const excluir = async (req, res) => {
  res.json(await DisciplinaService.excluir(req.params.id, req.usuarioId));
};

module.exports = { listar, criar, atualizar, excluir };