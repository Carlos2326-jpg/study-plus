const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { autenticar } = require("../middlewares/authMiddleware");

// Soma as horas estudadas na disciplina da meta, dentro do período da meta
async function horasDaMeta(usuarioId, meta) {
  const [rows] = await db.query(
    "SELECT COALESCE(SUM(duracao_minutos), 0) AS minutos FROM SessaoEstudo WHERE usuario_id = ? AND disciplina = ? AND duracao_minutos IS NOT NULL AND DATE(inicio) BETWEEN DATE(?) AND DATE(?)",
    [usuarioId, meta.disciplina, meta.data_inicio, meta.data_fim]
  );
  return Number(rows[0].minutos) / 60;
}

function calcularPercentual(horas, alvo) {
  if (!alvo || Number(alvo) <= 0) return 0;
  return Math.min(100, Math.round((horas / Number(alvo)) * 1000) / 10);
}

// GET /metas
router.get("/", autenticar, async (req, res) => {
  try {
    const [metas] = await db.query(
      "SELECT * FROM Meta WHERE usuario_id = ?",
      [req.usuarioId]
    );
    const comHoras = [];
    for (const meta of metas) {
      const horas = await horasDaMeta(req.usuarioId, meta);
      comHoras.push({ ...meta, horas_cumpridas: Math.round(horas * 100) / 100 });
    }
    res.json(comHoras);
  } catch (err) {
    console.error("ERRO METAS (listar):", err.message);
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

// POST /metas
router.post("/", autenticar, async (req, res) => {
  const { disciplina, carga_horaria_alvo, data_inicio, data_fim, tipo } = req.body;
  if (!disciplina || !carga_horaria_alvo || !data_inicio || !data_fim || !tipo)
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  try {
    const [result] = await db.query(
      "INSERT INTO Meta (usuario_id, disciplina, carga_horaria_alvo, data_inicio, data_fim, tipo) VALUES (?, ?, ?, ?, ?, ?)",
      [req.usuarioId, disciplina, carga_horaria_alvo, data_inicio, data_fim, tipo]
    );
    const [nova] = await db.query("SELECT * FROM Meta WHERE id = ?", [result.insertId]);
    res.status(201).json(nova[0]);
  } catch (err) {
    console.error("ERRO METAS (criar):", err.message);
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

// PUT /metas/:id
router.put("/:id", autenticar, async (req, res) => {
  const { disciplina, carga_horaria_alvo, data_inicio, data_fim, tipo, horas_cumpridas } = req.body;
  try {
    await db.query(
      "UPDATE Meta SET disciplina=?, carga_horaria_alvo=?, data_inicio=?, data_fim=?, tipo=?, horas_cumpridas=? WHERE id=? AND usuario_id=?",
      [disciplina, carga_horaria_alvo, data_inicio, data_fim, tipo, horas_cumpridas ?? 0, req.params.id, req.usuarioId]
    );
    const [atualizada] = await db.query("SELECT * FROM Meta WHERE id = ?", [req.params.id]);
    res.json(atualizada[0]);
  } catch (err) {
    console.error("ERRO METAS (atualizar):", err.message);
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

// DELETE /metas/:id
router.delete("/:id", autenticar, async (req, res) => {
  try {
    await db.query("DELETE FROM Meta WHERE id=? AND usuario_id=?", [req.params.id, req.usuarioId]);
    res.json({ success: true });
  } catch (err) {
    console.error("ERRO METAS (excluir):", err.message);
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

// GET /metas/:id/progresso
router.get("/:id/progresso", autenticar, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Meta WHERE id=? AND usuario_id=?", [req.params.id, req.usuarioId]);
    if (!rows.length) return res.status(404).json({ message: "Meta não encontrada." });
    const meta = rows[0];
    const horas = await horasDaMeta(req.usuarioId, meta);
    const percentual = calcularPercentual(horas, meta.carga_horaria_alvo);
    res.json({ percentual, meta: { ...meta, horas_cumpridas: Math.round(horas * 100) / 100 } });
  } catch (err) {
    console.error("ERRO METAS (progresso):", err.message);
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

module.exports = router;