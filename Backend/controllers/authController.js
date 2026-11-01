const AutenticacaoService = require("../models/regras_negocio/AutenticacaoService");

const registrar = async (req, res) => {
  res.status(201).json(await AutenticacaoService.registrar(req.body));
};

const login = async (req, res) => {
  res.json(await AutenticacaoService.login(req.body));
};

// JWT não tem estado no servidor: o logout real é o frontend apagar o token
const logout = async (req, res) => {
  res.json({ message: "Logout realizado com sucesso." });
};

const esqueciSenha = async (req, res) => {
  res.json(await AutenticacaoService.solicitarRecuperacao(req.body));
};

const validarCodigo = async (req, res) => {
  res.json(await AutenticacaoService.validarCodigo(req.body));
};

const redefinirSenha = async (req, res) => {
  res.json(await AutenticacaoService.redefinirSenha(req.body));
};

module.exports = { registrar, login, logout, esqueciSenha, validarCodigo, redefinirSenha };