const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { autenticar } = require("./auth");

// Aceita o formato da tela de Planejamento (disciplina, data_inicio,
// horario_inicio, horario_fim) e o da tela de Calendário (disciplina_id,
// tarefa_id, data, hora_inicio, hora_fim)
async function normalizar(body, usuarioId) {
  let disciplina_id = body.disciplina_id || null;
  if (!disciplina_id && body.disciplina) {
    const [disc] = await db.query(
      "SELECT id FROM Disciplina WHERE nome = ? AND usuario_id = ?",
      [body.disciplina, usuarioId]
    );
    disciplina_id = disc.length ? disc[0].id : null;
  }
  return {
    disciplina_id,
    tarefa_id: body.tarefa_id || null,
    data: body.data || body.data_inicio || null,
    hora_inicio: body.hora_inicio || body.horario_inicio || null,
    hora_fim: body.hora_fim || body.horario_fim || null,
    recorrencia: body.recorrencia || "nenhuma",
  };
}

router.get("/", autenticar, async (req, res) => {
  try {
    const [cronogramas] = await db.query(
      `SELECT c.*,
              d.nome AS disciplina,
              c.data AS data_inicio,
              c.data AS data_fim,
              c.hora_inicio AS horario_inicio,
              c.hora_fim AS horario_fim
         FROM Cronograma c
         LEFT JOIN Disciplina d ON d.id = c.disciplina_id
        WHERE c.usuario_id = ?
        ORDER BY c.data ASC, c.hora_inicio ASC`,
      [req.usuarioId]
    );
    res.json(cronogramas);
  } catch (err) {
    console.error("ERRO CRONOGRAMA (listar):", err.message);
    res.status(500).json({ erro: "Erro ao listar cronogramas.", detalhe: err.message });
  }
});

router.post("/", autenticar, async (req, res) => {
  try {
    const c = await normalizar(req.body, req.usuarioId);
    if (!c.data) return res.status(400).json({ erro: "Data é obrigatória." });
    const [result] = await db.query(
      "INSERT INTO Cronograma (usuario_id, disciplina_id, tarefa_id, data, hora_inicio, hora_fim, recorrencia) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.usuarioId, c.disciplina_id, c.tarefa_id, c.data, c.hora_inicio, c.hora_fim, c.recorrencia]
    );
    const [novo] = await db.query("SELECT * FROM Cronograma WHERE id = ?", [result.insertId]);
    res.status(201).json(novo[0]);
  } catch (err) {
    console.error("ERRO CRONOGRAMA (criar):", err.message);
    res.status(500).json({ erro: "Erro ao criar cronograma.", detalhe: err.message });
  }
});

router.put("/:id", autenticar, async (req, res) => {
  try {
    const c = await normalizar(req.body, req.usuarioId);
    await db.query(
      "UPDATE Cronograma SET disciplina_id=?, tarefa_id=?, data=?, hora_inicio=?, hora_fim=?, recorrencia=? WHERE id=? AND usuario_id=?",
      [c.disciplina_id, c.tarefa_id, c.data, c.hora_inicio, c.hora_fim, c.recorrencia, req.params.id, req.usuarioId]
    );
    const [atualizado] = await db.query("SELECT * FROM Cronograma WHERE id = ?", [req.params.id]);
    res.json(atualizado[0]);
  } catch (err) {
    console.error("ERRO CRONOGRAMA (atualizar):", err.message);
    res.status(500).json({ erro: "Erro ao atualizar cronograma.", detalhe: err.message });
  }
});

router.delete("/:id", autenticar, async (req, res) => {
  try {
    await db.query("DELETE FROM Cronograma WHERE id=? AND usuario_id=?", [req.params.id, req.usuarioId]);
    res.json({ mensagem: "Cronograma excluído com sucesso." });
  } catch (err) {
    console.error("ERRO CRONOGRAMA (excluir):", err.message);
    res.status(500).json({ erro: "Erro ao excluir cronograma.", detalhe: err.message });
  }
});

router.post("/validar-conflito", autenticar, async (req, res) => {
  const horario_inicio = req.body.horario_inicio || req.body.hora_inicio;
  const horario_fim = req.body.horario_fim || req.body.hora_fim;
  try {
    const [conflitos] = await db.query(
      "SELECT * FROM Cronograma WHERE usuario_id=? AND hora_inicio < ? AND hora_fim > ?",
      [req.usuarioId, horario_fim, horario_inicio]
    );
    res.json({ conflito: conflitos.length > 0 });
  } catch (err) {
    console.error("ERRO CRONOGRAMA (conflito):", err.message);
    res.status(500).json({ erro: "Erro ao validar conflito.", detalhe: err.message });
  }
});

module.exports = router;