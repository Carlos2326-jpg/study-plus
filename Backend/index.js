// ============================================================
// SERVER - Study+
// ============================================================

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const tarefasRoutes = require("./rout/tarefas.js");
const cronogramasRoutes = require("./rout/cronogramas.js");
const authRoutes = require("./rout/auth.js");
const dashboardRoutes = require("./rout/dashboard.js");
const metasRoutes = require("./rout/metas.js");
const sessoesRoutes = require("./rout/sessoes.js");
const disciplinasRoutes = require("./rout/disciplinas.js");
const relatoriosRoutes = require("./rout/relatorios.js");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tarefas", tarefasRoutes);
app.use("/cronogramas", cronogramasRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/metas", metasRoutes);
app.use("/sessoes", sessoesRoutes);
app.use("/registros-tempo", sessoesRoutes);
app.use("/disciplinas", disciplinasRoutes);
app.use("/relatorios", relatoriosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});