const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { autenticar } = require("../middlewares/authMiddleware");

// Aceita o formato da tela de Planejamento (disciplina, data_inicio, data_fim,
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

  const data = body.data || body.data_inicio || null;
  // Se não vier data_fim (ex.: Calendário), usa a mesma data de início
  const data_fim = body.data_fim || data;

  return {
    disciplina_id,
    tarefa_id: body.tarefa_id || null,
    data,
    data_fim,
    hora_inicio: body.hora_inicio || body.horario_inicio || null,
    hora_fim: body.hora_fim || body.horario_fim || null,
    recorrencia: body.recorrencia || "nenhuma",
  };
}

// Validação comum a criar e atualizar. Retorna a mensagem de erro ou null.
function validar(c) {
  if (!c.data) return "Data é obrigatória.";
  // Datas no formato YYYY-MM-DD podem ser comparadas como texto
  if (c.data_fim && c.data_fim < c.data) {
    return "A data de fim não pode ser anterior à data de início.";
  }
  return null;
}

router.get("/", autenticar, async (req, res) => {
  try {
    const [cronogramas] = await db.query(
      `SELECT c.*,
              d.nome AS disciplina,
              c.data AS data_inicio,
              COALESCE(c.data_fim, c.data) AS data_fim,
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
    const erro = validar(c);
    if (erro) return res.status(400).json({ erro });

    const [result] = await db.query(
      "INSERT INTO Cronograma (usuario_id, disciplina_id, tarefa_id, data, data_fim, hora_inicio, hora_fim, recorrencia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [req.usuarioId, c.disciplina_id, c.tarefa_id, c.data, c.data_fim, c.hora_inicio, c.hora_fim, c.recorrencia]
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
    const erro = validar(c);
    if (erro) return res.status(400).json({ erro });

    const [resultado] = await db.query(
      "UPDATE Cronograma SET disciplina_id=?, tarefa_id=?, data=?, data_fim=?, hora_inicio=?, hora_fim=?, recorrencia=? WHERE id=? AND usuario_id=?",
      [c.disciplina_id, c.tarefa_id, c.data, c.data_fim, c.hora_inicio, c.hora_fim, c.recorrencia, req.params.id, req.usuarioId]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: "Cronograma não encontrado." });
    }

    const [atualizado] = await db.query(
      "SELECT * FROM Cronograma WHERE id = ? AND usuario_id = ?",
      [req.params.id, req.usuarioId]
    );
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

// Conflito = os períodos de DATA se sobrepõem E os HORÁRIOS se sobrepõem.
// Opcionalmente ignora um id (útil ao editar o próprio cronograma).
router.post("/validar-conflito", autenticar, async (req, res) => {
  const horario_inicio = req.body.horario_inicio || req.body.hora_inicio;
  const horario_fim = req.body.horario_fim || req.body.hora_fim;
  const data_inicio = req.body.data_inicio || req.body.data;
  const data_fim = req.body.data_fim || data_inicio;
  const ignorarId = req.body.ignorar_id || 0;

  try {
    const [conflitos] = await db.query(
      `SELECT id FROM Cronograma
        WHERE usuario_id = ?
          AND id <> ?
          AND data <= ?
          AND COALESCE(data_fim, data) >= ?
          AND hora_inicio < ?
          AND hora_fim > ?`,
      [req.usuarioId, ignorarId, data_fim, data_inicio, horario_fim, horario_inicio]
    );
    res.json({ conflito: conflitos.length > 0 });
  } catch (err) {
    console.error("ERRO CRONOGRAMA (conflito):", err.message);
    res.status(500).json({ erro: "Erro ao validar conflito.", detalhe: err.message });
  }
});

module.exports = router;