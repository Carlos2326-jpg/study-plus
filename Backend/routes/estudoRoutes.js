const express = require("express");
const router = express.Router();

const cronogramaRoutes = require("./cronogramaRoutes");
const sessaoRoutes = require("./sessaoRoutes");

router.use("/cronogramas", cronogramaRoutes);
router.use("/sessoes", sessaoRoutes);
router.use("/registros-tempo", sessaoRoutes);

module.exports = router;