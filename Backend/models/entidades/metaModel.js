const pool = require("../../config/db.js");

const MetaModel = {
  listar: async (usuarioId) => {
    const [rows] = await pool.query("SELECT * FROM Meta WHERE usuario_id = ?", [usuarioId]);
    return rows;
  },

  buscarPorId: async (id, usuarioId) => {
    const [rows] = await pool.query(
      "SELECT * FROM Meta WHERE id = ? AND usuario_id = ?",
      [id, usuarioId]
    );
    return rows[0] || null;
  },

  criar: async (usuarioId, m) => {
    const [result] = await pool.query(
      "INSERT INTO Meta (usuario_id, disciplina, carga_horaria_alvo, data_inicio, data_fim, tipo) VALUES (?, ?, ?, ?, ?, ?)",
      [usuarioId, m.disciplina, m.carga_horaria_alvo, m.data_inicio, m.data_fim, m.tipo]
    );
    return MetaModel.buscarPorId(result.insertId, usuarioId);
  },

  atualizar: async (id, usuarioId, m) => {
    await pool.query(
      "UPDATE Meta SET disciplina=?, carga_horaria_alvo=?, data_inicio=?, data_fim=?, tipo=?, horas_cumpridas=? WHERE id=? AND usuario_id=?",
      [m.disciplina, m.carga_horaria_alvo, m.data_inicio, m.data_fim, m.tipo, m.horas_cumpridas ?? 0, id, usuarioId]
    );
    return MetaModel.buscarPorId(id, usuarioId);
  },

  excluir: async (id, usuarioId) => {
    await pool.query("DELETE FROM Meta WHERE id = ? AND usuario_id = ?", [id, usuarioId]);
  },

  // Minutos estudados na disciplina, dentro do período informado
  minutosEstudados: async (usuarioId, disciplina, inicio, fim) => {
    const [rows] = await pool.query(
      "SELECT COALESCE(SUM(duracao_minutos), 0) AS minutos FROM SessaoEstudo WHERE usuario_id = ? AND disciplina = ? AND duracao_minutos IS NOT NULL AND DATE(inicio) BETWEEN DATE(?) AND DATE(?)",
      [usuarioId, disciplina, inicio, fim]
    );
    return Number(rows[0].minutos);
  },
};

module.exports = MetaModel;