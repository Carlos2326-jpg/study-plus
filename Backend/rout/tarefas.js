const express = require("express");
const router = express.Router();
const {
  listarTarefas, buscarTarefa, criarTarefa, atualizarTarefa, excluirTarefa,
  listarSubtarefas, criarSubtarefa, atualizarSubtarefa, excluirSubtarefa,
} = require("../controllers/tarefaController.js");

router.get("/", listarTarefas);
router.get("/:id", buscarTarefa);
router.post("/", criarTarefa);
router.put("/:id", atualizarTarefa);
router.delete("/:id", excluirTarefa);

router.get("/:id/subtarefas", listarSubtarefas);
router.post("/:id/subtarefas", criarSubtarefa);
router.put("/subtarefas/:id", atualizarSubtarefa);
router.delete("/subtarefas/:id", excluirSubtarefa);

module.exports = router;