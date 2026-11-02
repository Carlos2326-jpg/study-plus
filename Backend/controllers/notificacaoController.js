const NotificacaoService = require("../models/regras_negocio/NotificacaoService");

const consultarNotificacoes = async (req, res) => {
  res.json(await NotificacaoService.consultar(req.usuarioId));
};

const enviarResumoPorEmail = async (req, res) => {
  res.json(await NotificacaoService.enviarPorEmail(req.usuarioId));
};

module.exports = { consultarNotificacoes, enviarResumoPorEmail };