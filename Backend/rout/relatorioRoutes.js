const express = require("express");
const router = express.Router();
const { autenticar } = require("../middlewares/authMiddleware");
const { produtividade, graficos } = require("../controllers/relatorioController");

router.use(autenticar);
router.get("/produtividade", produtividade);
router.get("/graficos", graficos);

module.exports = router;