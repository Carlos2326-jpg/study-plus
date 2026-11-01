const AutenticacaoService = require("../models/regras_negocio/AutenticacaoService");

const obterPerfil = async (req, res) => {
  res.json(await AutenticacaoService.obterPerfil(req.usuarioId));
};

const atualizarPerfil = async (req, res) => {
  const usuario = await AutenticacaoService.atualizarPerfil(req.usuarioId, req.body);
  res.json({ message: "Perfil atualizado com sucesso.", usuario });
};

module.exports = { obterPerfil, atualizarPerfil };