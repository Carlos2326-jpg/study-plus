const express = require("express");
const router = express.Router();
const { autenticar } = require("../middlewares/authMiddleware");
const {
  consultarNotificacoes, enviarResumoPorEmail,
} = require("../controllers/notificacaoController");

router.use(autenticar);

router.get("/", consultarNotificacoes);
router.post("/email", enviarResumoPorEmail);

module.exports = router;