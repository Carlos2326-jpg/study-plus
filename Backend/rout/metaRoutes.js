const express = require("express");
const router = express.Router();
const { autenticar } = require("../middlewares/authMiddleware");
const { validarId } = require("../middlewares/validationMiddleware");
const {
  listarMetas, buscarMeta, criarMeta, atualizarMeta, excluirMeta, progressoMeta,
} = require("../controllers/metaController");

router.use(autenticar);

router.get("/", listarMetas);
router.post("/", criarMeta);
router.get("/:id", validarId, buscarMeta);
router.get("/:id/progresso", validarId, progressoMeta);
router.put("/:id", validarId, atualizarMeta);
router.delete("/:id", validarId, excluirMeta);

module.exports = router;