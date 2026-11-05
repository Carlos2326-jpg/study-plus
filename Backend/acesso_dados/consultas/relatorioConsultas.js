const pool = require("../dbConnection");

// Monta o WHERE das sessões de estudo (período e disciplina são opcionais)
function filtroSessoes(usuarioId, { inicio, fim, disciplina } = {}) {
  let sql = " WHERE usuario_id = ?";
  const params = [usuarioId];
  if (inicio) { sql += " AND DATE(inicio) >= DATE(?)"; params.push(inicio); }
  if (fim) { sql += " AND DATE(inicio) <= DATE(?)"; params.push(fim); }
  if (disciplina) { sql += " AND disciplina = ?"; params.push(disciplina); }
  return { sql, params };
}

const RelatorioConsultas = {
  sessoes: async (usuarioId, filtros) => {
    const f = filtroSessoes(usuarioId, filtros);
    const [rows] = await pool.query(
      `SELECT * FROM SessaoEstudo${f.sql} ORDER BY inicio DESC`, f.params
    );
    return rows;
  },

  minutosTotais: async (usuarioId, filtros) => {
    const f = filtroSessoes(usuarioId, filtros);
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(duracao_minutos), 0) AS minutos FROM SessaoEstudo${f.sql}`, f.params
    );
    return Number(rows[0].minutos);
  },

  minutosPorDisciplina: async (usuarioId, filtros) => {
    const f = filtroSessoes(usuarioId, filtros);
    const [rows] = await pool.query(
      `SELECT disciplina, COALESCE(SUM(duracao_minutos), 0) AS minutos
         FROM SessaoEstudo${f.sql} AND disciplina IS NOT NULL
        GROUP BY disciplina ORDER BY minutos DESC`,
      f.params
    );
    return rows;
  },

  minutosPorDia: async (usuarioId, filtros) => {
    const f = filtroSessoes(usuarioId, filtros);
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(inicio, '%Y-%m-%d') AS dia, COALESCE(SUM(duracao_minutos), 0) AS minutos
         FROM SessaoEstudo${f.sql}
        GROUP BY dia ORDER BY dia`,
      f.params
    );
    return rows;
  },

  tarefasPorEstado: async (usuarioId) => {
    const [rows] = await pool.query(
      "SELECT COALESCE(status, 'pendente') AS estado, COUNT(*) AS total FROM Tarefa WHERE usuario_id = ? GROUP BY estado",
      [usuarioId]
    );
    return rows;
  },

  tarefasAtrasadas: async (usuarioId) => {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS n FROM Tarefa WHERE usuario_id = ? AND prazo < CURDATE() AND (status IS NULL OR status <> 'concluida')",
      [usuarioId]
    );
    return Number(rows[0].n);
  },

  proximosCronogramas: async (usuarioId, limite) => {
    const [rows] = await pool.query(
      `SELECT c.id, c.data, c.hora_inicio, c.hora_fim, d.nome AS disciplina
         FROM Cronograma c
         LEFT JOIN Disciplina d ON d.id = c.disciplina_id
        WHERE c.usuario_id = ? AND c.data >= CURDATE()
        ORDER BY c.data ASC, c.hora_inicio ASC
        LIMIT ?`,
      [usuarioId, limite]
    );
    return rows;
  },

  proximosPrazos: async (usuarioId, limite) => {
    const [rows] = await pool.query(
      "SELECT id, titulo, prazo FROM Tarefa WHERE usuario_id = ? AND prazo >= CURDATE() AND (status IS NULL OR status <> 'concluida') ORDER BY prazo ASC LIMIT ?",
      [usuarioId, limite]
    );
    return rows;
  },
};

module.exports = RelatorioConsultas;