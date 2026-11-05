// ============================================================
// SERVER - Study+
// ============================================================

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const loggingMiddleware = require("./middlewares/loggingMiddleware");
const { naoEncontrado, errorHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./routes/authRoutes.js");
const usuarioRoutes = require("./routes/usuarioRoutes.js");
const disciplinaRoutes = require("./routes/disciplinaRoutes.js");
const tarefaRoutes = require("./routes/tarefaRoutes.js");
const metaRoutes = require("./routes/metaRoutes.js");
const estudoRoutes = require("./routes/estudoRoutes.js");
const notificacaoRoutes = require("./routes/notificacaoRoutes.js");
const dashboardRoutes = require("./routes/dashboardRoutes.js");
const relatorioRoutes = require("./routes/relatorioRoutes.js");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);

app.use("/auth", authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/disciplinas", disciplinaRoutes);
app.use("/tarefas", tarefaRoutes);
app.use("/metas", metaRoutes);
app.use(estudoRoutes); // /cronogramas, /sessoes e /registros-tempo
app.use("/notificacoes", notificacaoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/relatorios", relatorioRoutes);

app.use(naoEncontrado);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});