const pool = require("../../acesso_dados/dbConnection");

// Devolve também os nomes que o Planejamento usa (data_inicio, data_fim, horario_*)
const SELECT = `SELECT c.*, d.nome AS disciplina,
    c.data AS data_inicio, c.data AS data_fim,
    c.hora_inicio AS horario_inicio, c.hora_fim AS horario_fim
  FROM Cronograma c
  LEFT JOIN Disciplina d ON d.id = c.disciplina_id`;

const CronogramaModel = {
  listar: async (usuarioId) => {
    const [rows] = await pool.query(
      `${SELECT} WHERE c.usuario_id = ? ORDER BY c.data ASC, c.hora_inicio ASC`, [usuarioId]
    );
    return rows;
  },

  buscarPorId: async (id, usuarioId) => {
    const [rows] = await pool.query(`${SELECT} WHERE c.id = ? AND c.usuario_id = ?`, [id, usuarioId]);
    return rows[0] || null;
  },

  // Insere várias ocorrências de uma vez; devolve o id da primeira
  criarVarios: async (linhas) => {
    const [r] = await pool.query(
      "INSERT INTO Cronograma (usuario_id, disciplina_id, tarefa_id, data, hora_inicio, hora_fim, recorrencia, serie_id) VALUES ?",
      [linhas]
    );
    return r.insertId;
  },

  atualizar: async (id, usuarioId, campos) => {
    await pool.query("UPDATE Cronograma SET ? WHERE id = ? AND usuario_id = ?", [campos, id, usuarioId]);
  },

  excluir: async (id, usuarioId) => {
    await pool.query("DELETE FROM Cronograma WHERE id = ? AND usuario_id = ?", [id, usuarioId]);
  },

  excluirSerie: async (serieId, usuarioId) => {
    await pool.query("DELETE FROM Cronograma WHERE serie_id = ? AND usuario_id = ?", [serieId, usuarioId]);
  },

  // Primeira data (entre as informadas) em que o horário colide com outro cronograma
  primeiroConflito: async (usuarioId, datas, horaInicio, horaFim, ignorarId = 0) => {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(data, '%Y-%m-%d') AS data
         FROM Cronograma
        WHERE usuario_id = ? AND id <> ? AND data IN (?)
          AND hora_inicio < ? AND hora_fim > ?
        ORDER BY data LIMIT 1`,
      [usuarioId, ignorarId, datas, horaFim, horaInicio]
    );
    return rows[0]?.data || null;
  },
};

module.exports = CronogramaModel;