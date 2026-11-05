const pool = require("../../acesso_dados/dbConnection");

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

    listarComVinculos: async (usuario_id) => {
    const [rows] = await pool.query(
      `SELECT d.*,
              (SELECT COUNT(*) FROM Tarefa t WHERE t.disciplina_id = d.id) AS total_tarefas,
              (SELECT COUNT(*) FROM Cronograma c WHERE c.disciplina_id = d.id) AS total_cronogramas
         FROM Disciplina d
        WHERE d.usuario_id = ?
        ORDER BY d.nome`,
      [usuario_id]
    );
    return rows;
  },

  inserir: async (usuario_id, nome, descricao) => {
    const [r] = await pool.query(
      "INSERT INTO Disciplina (usuario_id, nome, descricao) VALUES (?, ?, ?)",
      [usuario_id, nome, descricao]
    );
    return r.insertId;
  },

  nomeEmUso: async (nome, usuario_id, ignorarId = 0) => {
    const [rows] = await pool.query(
      "SELECT id FROM Disciplina WHERE nome = ? AND usuario_id = ? AND id <> ? LIMIT 1",
      [nome, usuario_id, ignorarId]
    );
    return rows.length > 0;
  },

  atualizarDados: async (id, usuario_id, nome, descricao) => {
    await pool.query(
      "UPDATE Disciplina SET nome = ?, descricao = ? WHERE id = ? AND usuario_id = ?",
      [nome, descricao, id, usuario_id]
    );
  },

  // Metas e sessões guardam a disciplina pelo nome: acompanham a renomeação
  propagarNome: async (usuario_id, antigo, novo) => {
    await pool.query("UPDATE Meta SET disciplina = ? WHERE usuario_id = ? AND disciplina = ?", [novo, usuario_id, antigo]);
    await pool.query("UPDATE SessaoEstudo SET disciplina = ? WHERE usuario_id = ? AND disciplina = ?", [novo, usuario_id, antigo]);
  },

  contarVinculos: async (id, nome, usuario_id) => {
    const [rows] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM Tarefa WHERE disciplina_id = ?) AS tarefas,
         (SELECT COUNT(*) FROM Cronograma WHERE disciplina_id = ?) AS cronogramas,
         (SELECT COUNT(*) FROM Meta WHERE usuario_id = ? AND disciplina = ?) AS metas`,
      [id, id, usuario_id, nome]
    );
    return {
      tarefas: Number(rows[0].tarefas),
      cronogramas: Number(rows[0].cronogramas),
      metas: Number(rows[0].metas),
    };
  },

  removerPorId: async (id, usuario_id) => {
    await pool.query("DELETE FROM Disciplina WHERE id = ? AND usuario_id = ?", [id, usuario_id]);
  },
};

module.exports = DisciplinaModel;