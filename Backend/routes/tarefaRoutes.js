const express = require("express");
const router = express.Router();
const { autenticar } = require("../middlewares/authMiddleware.js");
const { exigirCampos, validarId } = require("../middlewares/validationMiddleware.js");
const {
  listarTarefas, buscarTarefa, criarTarefa, atualizarTarefa, excluirTarefa,
  listarSubtarefas, criarSubtarefa, atualizarSubtarefa, excluirSubtarefa,
} = require("../controllers/tarefaController.js");

router.use(autenticar);

router.get("/", listarTarefas);
router.get("/:id", validarId, buscarTarefa);
router.post("/", exigirCampos(["titulo"]), criarTarefa);
router.put("/:id", validarId, atualizarTarefa);
router.delete("/:id", validarId, excluirTarefa);

router.get("/:id/subtarefas", validarId, listarSubtarefas);
router.post("/:id/subtarefas", validarId, criarSubtarefa);
router.put("/subtarefas/:id", validarId, atualizarSubtarefa);
router.delete("/subtarefas/:id", validarId, excluirSubtarefa);

module.exports = router;