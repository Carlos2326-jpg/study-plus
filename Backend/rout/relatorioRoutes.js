const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { autenticar } = require("../middlewares/authMiddleware");

// GET /relatorios/produtividade
router.get("/produtividade", autenticar, async (req, res) => {
  try {
    const [sessoes] = await db.query(
      "SELECT * FROM SessaoEstudo WHERE usuario_id = ?",
      [req.usuarioId]
    );
    const totalMinutos = sessoes.reduce((acc, s) => acc + (s.duracao_minutos || 0), 0);
    res.json({
      totalHoras: +(totalMinutos / 60).toFixed(2),
      totalSessoes: sessoes.length,
      sessoes,
    });
  } catch (err) {
    console.error("ERRO RELATORIOS (produtividade):", err.message);
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

// GET /relatorios/graficos
router.get("/graficos", autenticar, async (req, res) => {
  try {
    const [sessoes] = await db.query(
      "SELECT * FROM SessaoEstudo WHERE usuario_id = ?",
      [req.usuarioId]
    );
    const [metas] = await db.query(
      "SELECT * FROM Meta WHERE usuario_id = ?",
      [req.usuarioId]
    );

    const porDisciplina = sessoes.reduce((acc, s) => {
      if (!s.disciplina) return acc;
      if (!acc[s.disciplina]) acc[s.disciplina] = 0;
      acc[s.disciplina] += s.duracao_minutos || 0;
      return acc;
    }, {});

    const barras = Object.entries(porDisciplina).map(([disciplina, minutos]) => ({
      disciplina,
      horas: +(minutos / 60).toFixed(2),
    }));

    const pizza = barras.map((item) => ({
      name: item.disciplina,
      value: item.horas,
    }));

    // Progresso das metas: horas estudadas na disciplina dentro do período da meta
    const progresso = [];
    for (const meta of metas) {
      const [rows] = await db.query(
        "SELECT COALESCE(SUM(duracao_minutos), 0) AS minutos FROM SessaoEstudo WHERE usuario_id = ? AND disciplina = ? AND duracao_minutos IS NOT NULL AND DATE(inicio) BETWEEN DATE(?) AND DATE(?)",
        [req.usuarioId, meta.disciplina, meta.data_inicio, meta.data_fim]
      );
      const horas = Number(rows[0].minutos) / 60;
      const alvo = Number(meta.carga_horaria_alvo) || 0;
      progresso.push({
        disciplina: meta.disciplina,
        alvo: meta.carga_horaria_alvo,
        cumprido: Math.round(horas * 100) / 100,
        percentual: alvo > 0 ? Math.min(100, Math.round((horas / alvo) * 1000) / 10) : 0,
      });
    }

    res.json({ barras, pizza, progresso });
  } catch (err) {
    console.error("ERRO RELATORIOS (graficos):", err.message);
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

module.exports = router;