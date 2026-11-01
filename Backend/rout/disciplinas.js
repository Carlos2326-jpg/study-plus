const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { autenticar } = require("./auth");

// GET /disciplinas
router.get("/", autenticar, async (req, res) => {
  try {
    const [disciplinas] = await db.query(
      "SELECT * FROM Disciplina WHERE usuario_id = ?",
      [req.usuarioId]
    );
    res.json(disciplinas);
  } catch (err) {
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

// POST /disciplinas
router.post("/", autenticar, async (req, res) => {
  const { nome, descricao } = req.body;
  if (!nome) return res.status(400).json({ message: "Nome é obrigatório." });
  try {
    const [result] = await db.query(
      "INSERT INTO Disciplina (usuario_id, nome, descricao) VALUES (?, ?, ?)",
      [req.usuarioId, nome, descricao || ""]
    );
    res.status(201).json({ id: result.insertId, nome, descricao });
  } catch (err) {
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

module.exports = router;