const express = require("express");
const router = express.Router();
const { autenticar } = require("../middlewares/authMiddleware");
const { validarId } = require("../middlewares/validationMiddleware");
const {
  listarSessoes, obterSessaoAtiva, iniciarSessao, pausarSessao, retomarSessao, pingSessao,
  registrarBloco, finalizarSessao, registrarTempoManual, editarSessao, excluirSessao,
} = require("../controllers/sessaoController");

router.use(autenticar);

router.get("/", listarSessoes);
router.get("/ativa", obterSessaoAtiva);
router.post("/", iniciarSessao);
router.post("/manual", registrarTempoManual);

router.put("/:id/pausar", validarId, pausarSessao);
router.put("/:id/retomar", validarId, retomarSessao);
router.put("/:id/ping", validarId, pingSessao);
router.put("/:id/bloco", validarId, registrarBloco);
router.put("/:id/finalizar", validarId, finalizarSessao);

router.put("/:id", validarId, editarSessao);
router.delete("/:id", validarId, excluirSessao);

module.exports = router;