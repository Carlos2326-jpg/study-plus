const express = require("express");
const router = express.Router();
const { autenticar } = require("../middlewares/authMiddleware");
const { validarId } = require("../middlewares/validationMiddleware");
const { listar, criar, atualizar, excluir } = require("../controllers/DisciplinaController");

router.use(autenticar);

router.get("/", listar);
router.post("/", criar);
router.put("/:id", validarId, atualizar);
router.delete("/:id", validarId, excluir);

module.exports = router;