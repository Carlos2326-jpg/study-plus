const pool = require("../../config/db.js");

const SubtarefaModel = {
  listarPorTarefa: async (tarefa_id) => {
    const [rows] = await pool.query("SELECT * FROM Subtarefa WHERE tarefa_id = ?", [tarefa_id]);
    return rows;
  },

    buscarPorId: async (id, usuario_id) => {
    const [rows] = await pool.query(
      `SELECT s.* FROM Subtarefa s
         JOIN Tarefa t ON t.id = s.tarefa_id
        WHERE s.id = ? AND t.usuario_id = ?`,
      [id, usuario_id]
    );
    return rows[0] || null;
  },

  criar: async (tarefa_id, titulo) => {
    const [result] = await pool.query(
      "INSERT INTO Subtarefa (tarefa_id, titulo, concluida) VALUES (?, ?, false)",
      [tarefa_id, titulo]
    );
    return { id: result.insertId, tarefa_id, titulo, concluida: false };
  },

  atualizar: async (id, dados) => {
    const { titulo, concluida } = dados;
    await pool.query("UPDATE Subtarefa SET titulo = ?, concluida = ? WHERE id = ?", [titulo, concluida, id]);
    return { id, ...dados };
  },

  excluir: async (id) => {
    await pool.query("DELETE FROM Subtarefa WHERE id = ?", [id]);
    return { id };
  },
};

module.exports = SubtarefaModel;