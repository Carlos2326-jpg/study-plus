const SessaoService = require("../models/regras_negocio/SessaoService");

const listarSessoes = async (req, res) => {
  res.json(await SessaoService.listar(req.usuarioId));
};

const obterSessaoAtiva = async (req, res) => {
  res.json(await SessaoService.obterAtiva(req.usuarioId));
};

const iniciarSessao = async (req, res) => {
  res.status(201).json(await SessaoService.iniciar(req.usuarioId, req.body));
};

const pausarSessao = async (req, res) => {
  res.json(await SessaoService.pausar(req.params.id, req.usuarioId));
};

const retomarSessao = async (req, res) => {
  res.json(await SessaoService.retomar(req.params.id, req.usuarioId));
};

const pingSessao = async (req, res) => {
  res.json(await SessaoService.ping(req.params.id, req.usuarioId));
};

const registrarBloco = async (req, res) => {
  res.json(await SessaoService.registrarBloco(req.params.id, req.usuarioId));
};

const finalizarSessao = async (req, res) => {
  res.json(await SessaoService.finalizar(req.params.id, req.usuarioId, req.body));
};

const registrarTempoManual = async (req, res) => {
  res.status(201).json(await SessaoService.registrarManual(req.usuarioId, req.body));
};

const editarSessao = async (req, res) => {
  res.json(await SessaoService.editar(req.params.id, req.usuarioId, req.body));
};

const excluirSessao = async (req, res) => {
  res.json(await SessaoService.excluir(req.params.id, req.usuarioId));
};

module.exports = {
  listarSessoes, obterSessaoAtiva, iniciarSessao, pausarSessao, retomarSessao, pingSessao,
  registrarBloco, finalizarSessao, registrarTempoManual, editarSessao, excluirSessao,
};