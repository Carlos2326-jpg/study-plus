const CronogramaService = require("../models/regras_negocio/CronogramaService");

const listarCronogramas = async (req, res) => {
  res.json(await CronogramaService.listar(req.usuarioId));
};

const criarCronograma = async (req, res) => {
  res.status(201).json(await CronogramaService.criar(req.usuarioId, req.body));
};

const atualizarCronograma = async (req, res) => {
  res.json(await CronogramaService.atualizar(req.params.id, req.usuarioId, req.body));
};

const excluirCronograma = async (req, res) => {
  const serie = req.query.serie === "true";
  res.json(await CronogramaService.excluir(req.params.id, req.usuarioId, serie));
};

const validarConflito = async (req, res) => {
  res.json(await CronogramaService.validarConflito(req.usuarioId, req.body));
};

module.exports = {
  listarCronogramas, criarCronograma, atualizarCronograma, excluirCronograma, validarConflito,
};