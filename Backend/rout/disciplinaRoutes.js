const express = require("express");
const router = express.Router();
const { autenticar } = require("../middlewares/authMiddleware");
const { exigirCampos, validarId } = require("../middlewares/validationMiddleware");
const {
  listarDisciplinas, buscarDisciplina, criarDisciplina, atualizarDisciplina, excluirDisciplina,
} = require("../controllers/disciplinaController.js");

router.use(autenticar);

router.get("/", listarDisciplinas);
router.get("/:id", validarId, buscarDisciplina);
router.post("/", exigirCampos(["nome"]), criarDisciplina);
router.put("/:id", validarId, exigirCampos(["nome"]), atualizarDisciplina);
router.delete("/:id", validarId, excluirDisciplina);

module.exports = router;