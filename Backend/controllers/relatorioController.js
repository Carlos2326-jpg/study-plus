const RelatorioService = require("../models/regras_negocio/RelatorioService");

const produtividade = async (req, res) => {
  res.json(await RelatorioService.produtividade(req.usuarioId, req.query));
};

const graficos = async (req, res) => {
  res.json(await RelatorioService.graficos(req.usuarioId, req.query));
};

module.exports = { produtividade, graficos };