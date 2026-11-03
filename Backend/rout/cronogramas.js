const express = require("express");
const router = express.Router();
const { autenticar } = require("../middlewares/authMiddleware");
const { validarId } = require("../middlewares/validationMiddleware");
const {
  listarCronogramas, criarCronograma, atualizarCronograma, excluirCronograma, validarConflito,
} = require("../controllers/cronogramaController");

router.use(autenticar);

router.get("/", listarCronogramas);
router.post("/", criarCronograma);
router.post("/validar-conflito", validarConflito);
router.put("/:id", validarId, atualizarCronograma);
router.delete("/:id", validarId, excluirCronograma);

module.exports = router;