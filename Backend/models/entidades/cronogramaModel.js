const pool = require("../../config/db.js");

const CronogramaModel = {
  listar: async (usuario_id) => {
    const [rows] = await pool.query("SELECT * FROM Cronograma WHERE usuario_id = ?", [usuario_id]);
    return rows;
  },

  criar: async (dados) => {
  const { usuario_id, disciplina_id, tarefa_id, data, hora_inicio, hora_fim, recorrencia } = dados;
  const [result] = await pool.query(
    "INSERT INTO Cronograma (usuario_id, disciplina_id, tarefa_id, data, hora_inicio, hora_fim, recorrencia) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [usuario_id, disciplina_id || null, tarefa_id || null, data, hora_inicio, hora_fim, recorrencia]
  );
  return { id: result.insertId, ...dados };
},

  atualizar: async (id, dados) => {
    const { disciplina_id, data, hora_inicio, hora_fim, recorrencia } = dados;
    await pool.query(
      "UPDATE Cronograma SET disciplina_id = ?, data = ?, hora_inicio = ?, hora_fim = ?, hora_fim = ?, recorrencia = ? WHERE id = ?",
      [disciplina_id, data, hora_inicio, hora_fim, hora_fim, recorrencia, id]
    );
    return { id, ...dados };
  },

  excluir: async (id) => {
    await pool.query("DELETE FROM Cronograma WHERE id = ?", [id]);
    return { id };
  },
};

module.exports = CronogramaModel;