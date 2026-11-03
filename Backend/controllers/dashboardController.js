const RelatorioService = require("../models/regras_negocio/RelatorioService");

const obterMetricas = async (req, res) => {
  res.json(await RelatorioService.dashboard(req.usuarioId));
};

module.exports = { obterMetricas };