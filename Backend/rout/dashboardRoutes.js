const express = require("express");
const router = express.Router();
const { autenticar } = require("../middlewares/authMiddleware");
const { obterMetricas } = require("../controllers/dashboardController");

router.use(autenticar);
router.get("/metrica", obterMetricas);

module.exports = router;