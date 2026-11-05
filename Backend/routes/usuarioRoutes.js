const express = require("express");
const router = express.Router();
const { autenticar } = require("../middlewares/authMiddleware");
const { obterPerfil, atualizarPerfil } = require("../controllers/usuarioController");

router.use(autenticar);
router.get("/me", obterPerfil);
router.put("/me", atualizarPerfil);

module.exports = router;