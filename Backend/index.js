// ============================================================
// SERVER - Study+
// ============================================================

const express = require("express");
const cors = require("cors");
const loggingMiddleware = require("./middlewares/loggingMiddleware");
const { naoEncontrado, errorHandler } = require("./middlewares/errorHandler");
require("dotenv").config();

const usuarioRoutes = require("./rout/usuarioRoutes.js");
const tarefasRoutes = require("./rout/tarefaRoutes.js");
const cronogramasRoutes = require("./rout/cronogramas.js");
const authRoutes = require("./rout/authRoutes.js");
const dashboardRoutes = require("./rout/dashboardRoutes.js");
const metasRoutes = require("./rout/metaRoutes.js");
const sessoesRoutes = require("./rout/sessoes.js");
const disciplinasRoutes = require("./rout/disciplinaRoutes.js");
const relatoriosRoutes = require("./rout/relatorioRoutes.js");


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(loggingMiddleware); 

app.use("/auth", authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/tarefas", tarefasRoutes);
app.use("/cronogramas", cronogramasRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/metas", metasRoutes);
app.use("/sessoes", sessoesRoutes);
app.use("/registros-tempo", sessoesRoutes);
app.use("/disciplinas", disciplinasRoutes);
app.use("/relatorios", relatoriosRoutes);
app.use(naoEncontrado);              
app.use(errorHandler); 

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});