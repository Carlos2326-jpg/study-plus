const pool = require("../../config/db.js");

const DisciplinaModel = {
  listar: async (usuario_id) => {
    const [rows] = await pool.query("SELECT * FROM Disciplina WHERE usuario_id = ?", [usuario_id]);
    return rows;
  },

  buscarPorId: async (id, usuario_id) => {
    const [rows] = await pool.query(
      "SELECT * FROM Disciplina WHERE id = ? AND usuario_id = ?", [id, usuario_id]
    );
    return rows[0] || null;
  },

  buscarPorNome: async (nome, usuario_id) => {
    const [rows] = await pool.query(
      "SELECT * FROM Disciplina WHERE nome = ? AND usuario_id = ?", [nome, usuario_id]
    );
    return rows[0] || null;
  },

  criar: async ({ usuario_id, nome, descricao }) => {
    const [result] = await pool.query(
      "INSERT INTO Disciplina (usuario_id, nome, descricao) VALUES (?, ?, ?)",
      [usuario_id, nome, descricao || ""]
    );
    return { id: result.insertId, nome, descricao: descricao || "" };
  },

  atualizar: async (id, usuario_id, { nome, descricao }) => {
    await pool.query(
      "UPDATE Disciplina SET nome = ?, descricao = ? WHERE id = ? AND usuario_id = ?",
      [nome, descricao || "", id, usuario_id]
    );
    return { id: Number(id), nome, descricao: descricao || "" };
  },

  // Quantidade de registros que dependem da disciplina
  contarVinculos: async (id) => {
    const [[t]] = await pool.query("SELECT COUNT(*) AS n FROM Tarefa WHERE disciplina_id = ?", [id]);
    const [[c]] = await pool.query("SELECT COUNT(*) AS n FROM Cronograma WHERE disciplina_id = ?", [id]);
    return t.n + c.n;
  },

  excluir: async (id, usuario_id) => {
    await pool.query("DELETE FROM Disciplina WHERE id = ? AND usuario_id = ?", [id, usuario_id]);
  },
};

module.exports = DisciplinaModel;