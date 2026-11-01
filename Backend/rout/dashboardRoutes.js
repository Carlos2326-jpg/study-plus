const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { autenticar } = require("../middlewares/authMiddleware");

router.get("/metrica", autenticar, async (req, res) => {
  try {
    const usuarioId = req.usuarioId;

    const [tarefas] = await db.query(
      "SELECT status FROM Tarefa WHERE usuario_id = ?",
      [usuarioId]
    );

    const totalTarefas = tarefas.length;
    const concluidas = tarefas.filter((t) => t.status === "concluida").length;

    // Cronogramas de hoje em diante
    const [cronogramas] = await db.query(
      `SELECT c.id, c.data, c.hora_inicio, c.hora_fim, d.nome AS disciplina
         FROM Cronograma c
         LEFT JOIN Disciplina d ON d.id = c.disciplina_id
        WHERE c.usuario_id = ? AND c.data >= CURDATE()
        ORDER BY c.data ASC, c.hora_inicio ASC
        LIMIT 5`,
      [usuarioId]
    );

    // Tarefas não concluídas com prazo de hoje em diante
    const [tarefasPrazo] = await db.query(
      "SELECT id, titulo, prazo FROM Tarefa WHERE usuario_id = ? AND prazo >= CURDATE() AND status <> 'concluida' ORDER BY prazo ASC LIMIT 5",
      [usuarioId]
    );

    const hhmm = (h) => (h ? String(h).slice(0, 5) : "");

    const eventosCronograma = cronogramas.map((c) => {
      const nome = c.disciplina || "Estudo";
      return {
        id: `c${c.id}`,
        titulo:
          c.hora_inicio && c.hora_fim
            ? `${nome} - ${hhmm(c.hora_inicio)} às ${hhmm(c.hora_fim)}`
            : nome,
        data: c.data,
      };
    });

    const eventosTarefas = tarefasPrazo.map((t) => ({
      id: `t${t.id}`,
      titulo: `Prazo: ${t.titulo}`,
      data: t.prazo,
    }));

    const proximosEventos = [...eventosCronograma, ...eventosTarefas]
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .slice(0, 5);

    res.json({ totalTarefas, concluidas, proximosEventos });
  } catch (err) {
    console.error("ERRO DASHBOARD:", err.message);
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

module.exports = router;