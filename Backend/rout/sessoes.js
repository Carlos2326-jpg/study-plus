const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { autenticar } = require("./auth");

// GET /sessoes
router.get("/", autenticar, async (req, res) => {
  try {
    const [sessoes] = await db.query(
      "SELECT * FROM SessaoEstudo WHERE usuario_id = ? ORDER BY inicio DESC",
      [req.usuarioId]
    );
    res.json(sessoes);
  } catch (err) {
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

// POST /sessoes
router.post("/", autenticar, async (req, res) => {
  const { disciplina, tecnica_usada, tarefa_id } = req.body;
  if (!disciplina || !tecnica_usada)
    return res.status(400).json({ message: "Disciplina e técnica são obrigatórios." });
  try {
    const [result] = await db.query(
      "INSERT INTO SessaoEstudo (usuario_id, disciplina, tecnica_usada, tarefa_id, inicio) VALUES (?, ?, ?, ?, NOW())",
      [req.usuarioId, disciplina, tecnica_usada, tarefa_id || null]
    );
    const [nova] = await db.query("SELECT * FROM SessaoEstudo WHERE id = ?", [result.insertId]);
    res.status(201).json(nova[0]);
  } catch (err) {
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

// PUT /sessoes/:id/finalizar
router.put("/:id/finalizar", autenticar, async (req, res) => {
  const { duracao_minutos, anotacao } = req.body;
  try {
    await db.query(
      "UPDATE SessaoEstudo SET fim=NOW(), duracao_minutos=?, anotacao=? WHERE id=? AND usuario_id=?",
      [duracao_minutos, anotacao || "", req.params.id, req.usuarioId]
    );

    // Atualiza horas cumpridas na meta correspondente
    const [sessao] = await db.query("SELECT * FROM SessaoEstudo WHERE id=?", [req.params.id]);
    if (sessao.length && sessao[0].disciplina) {
      await db.query(
        "UPDATE Meta SET horas_cumpridas = horas_cumpridas + ? WHERE usuario_id=? AND disciplina=?",
        [duracao_minutos / 60, req.usuarioId, sessao[0].disciplina]
      );
    }

    const [atualizada] = await db.query("SELECT * FROM SessaoEstudo WHERE id=?", [req.params.id]);
    res.json(atualizada[0]);
  } catch (err) {
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

// POST /registros-tempo/manual
router.post("/manual", autenticar, async (req, res) => {
  const { disciplina, tecnica_usada, duracao_minutos, anotacao } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO SessaoEstudo (usuario_id, disciplina, tecnica_usada, duracao_minutos, anotacao, inicio, fim) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
      [req.usuarioId, disciplina, tecnica_usada, duracao_minutos, anotacao || ""]
    );
    const [nova] = await db.query("SELECT * FROM SessaoEstudo WHERE id=?", [result.insertId]);
    res.json(nova[0]);
  } catch (err) {
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

module.exports = router;