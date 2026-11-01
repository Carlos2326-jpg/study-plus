const pool = require("../../config/db.js");

const TarefaModel = {
  listar: async (usuario_id, filtros = {}) => {
    let query = "SELECT * FROM Tarefa WHERE usuario_id = ?";
    const params = [usuario_id];

    if (filtros.status) { query += " AND status = ?"; params.push(filtros.status); }
    if (filtros.prioridade) { query += " AND prioridade = ?"; params.push(filtros.prioridade); }
    if (filtros.disciplina_id) { query += " AND disciplina_id = ?"; params.push(filtros.disciplina_id); }
    if (filtros.titulo) { query += " AND titulo LIKE ?"; params.push(`%${filtros.titulo}%`); }

    const [rows] = await pool.query(query, params);
    return rows;
  },

  buscarPorId: async (id) => {
    const [rows] = await pool.query("SELECT * FROM Tarefa WHERE id = ?", [id]);
    return rows[0] || null;
  },

  criar: async (dados) => {
    const { usuario_id, disciplina_id, titulo, prioridade, status, prazo } = dados;
    const criado_em = new Date().toISOString().split("T")[0];
    const [result] = await pool.query(
      "INSERT INTO Tarefa (usuario_id, disciplina_id, titulo, prioridade, status, prazo, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [usuario_id, disciplina_id, titulo, prioridade, status, prazo, criado_em]
    );
    return { id: result.insertId, ...dados, criado_em };
  },

  atualizar: async (id, dados) => {
    const { titulo, disciplina_id, prioridade, status, prazo } = dados;
    await pool.query(
      "UPDATE Tarefa SET titulo = ?, disciplina_id = ?, prioridade = ?, status = ?, prazo = ? WHERE id = ?",
      [titulo, disciplina_id, prioridade, status, prazo, id]
    );
    return { id, ...dados };
  },

  excluir: async (id) => {
  // Remove cronogramas vinculados antes de excluir a tarefa
  await pool.query("DELETE FROM Cronograma WHERE tarefa_id = ?", [id]);
  await pool.query("DELETE FROM Tarefa WHERE id = ?", [id]);
  return { id };
},
};

module.exports = TarefaModel;