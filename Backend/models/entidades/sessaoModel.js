const pool = require("../../config/db.js");

// Traz também os segundos decorridos, calculados pelo relógio do banco
const SELECT = `SELECT s.*,
    TIMESTAMPDIFF(SECOND, s.retomado_em, NOW()) AS segundos_trecho,
    TIMESTAMPDIFF(SECOND, s.ultimo_ping, NOW()) AS segundos_desde_ping,
    TIMESTAMPDIFF(SECOND, s.inicio, NOW()) AS segundos_desde_inicio
  FROM SessaoEstudo s`;

const SessaoModel = {
  listar: async (usuarioId) => {
    const [rows] = await pool.query(
      `${SELECT} WHERE s.usuario_id = ? ORDER BY s.inicio DESC`, [usuarioId]
    );
    return rows;
  },

  buscarPorId: async (id, usuarioId) => {
    const [rows] = await pool.query(
      `${SELECT} WHERE s.id = ? AND s.usuario_id = ?`, [id, usuarioId]
    );
    return rows[0] || null;
  },

  buscarAtiva: async (usuarioId) => {
    const [rows] = await pool.query(
      `${SELECT} WHERE s.usuario_id = ? AND s.estado IN ('em_andamento', 'pausada')
        ORDER BY s.id DESC LIMIT 1`,
      [usuarioId]
    );
    return rows[0] || null;
  },

  iniciar: async (usuarioId, d) => {
    const [r] = await pool.query(
      `INSERT INTO SessaoEstudo
         (usuario_id, disciplina, tecnica_usada, tarefa_id, inicio, estado, retomado_em,
          acumulado_segundos, foco_min, pausa_min, blocos_planejados)
       VALUES (?, ?, ?, ?, NOW(), 'em_andamento', NOW(), 0, ?, ?, ?)`,
      [usuarioId, d.disciplina, d.tecnica_usada, d.tarefa_id, d.foco_min, d.pausa_min, d.blocos_planejados]
    );
    return r.insertId;
  },

  pausar: async (id, usuarioId, acumulado) => {
    await pool.query(
      "UPDATE SessaoEstudo SET estado = 'pausada', acumulado_segundos = ?, retomado_em = NULL, pausas = pausas + 1 WHERE id = ? AND usuario_id = ?",
      [acumulado, id, usuarioId]
    );
  },

  retomar: async (id, usuarioId) => {
    await pool.query(
      "UPDATE SessaoEstudo SET estado = 'em_andamento', retomado_em = NOW(), ultimo_ping = IF(ultimo_ping IS NULL, NULL, NOW()) WHERE id = ? AND usuario_id = ?",
      [id, usuarioId]
    );
  },

  encerrar: async (id, usuarioId, { acumulado, duracao, anotacao }) => {
    await pool.query(
      "UPDATE SessaoEstudo SET estado = 'encerrada', acumulado_segundos = ?, retomado_em = NULL, fim = NOW(), duracao_minutos = ?, anotacao = ? WHERE id = ? AND usuario_id = ?",
      [acumulado, duracao, anotacao, id, usuarioId]
    );
  },

  ping: async (id, usuarioId) => {
    await pool.query(
      "UPDATE SessaoEstudo SET ultimo_ping = NOW() WHERE id = ? AND usuario_id = ?", [id, usuarioId]
    );
  },

  registrarBloco: async (id, usuarioId) => {
    await pool.query(
      "UPDATE SessaoEstudo SET blocos_concluidos = blocos_concluidos + 1 WHERE id = ? AND usuario_id = ?",
      [id, usuarioId]
    );
  },

  criarRegistro: async (usuarioId, d) => {
    const [r] = await pool.query(
      `INSERT INTO SessaoEstudo
         (usuario_id, disciplina, tecnica_usada, tarefa_id, duracao_minutos, anotacao,
          inicio, fim, estado, acumulado_segundos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'encerrada', ?)`,
      [usuarioId, d.disciplina, d.tecnica_usada, d.tarefa_id, d.duracao_minutos, d.anotacao,
       d.inicio, d.fim, d.duracao_minutos * 60]
    );
    return r.insertId;
  },

  atualizarRegistro: async (id, usuarioId, campos) => {
    await pool.query("UPDATE SessaoEstudo SET ? WHERE id = ? AND usuario_id = ?", [campos, id, usuarioId]);
  },

  excluir: async (id, usuarioId) => {
    await pool.query("DELETE FROM SessaoEstudo WHERE id = ? AND usuario_id = ?", [id, usuarioId]);
  },

  // Já existe outro registro encerrado que se sobrepõe a este intervalo?
  haSobreposicao: async (usuarioId, inicio, fim, ignorarId = 0) => {
    const [rows] = await pool.query(
      "SELECT id FROM SessaoEstudo WHERE usuario_id = ? AND id <> ? AND fim IS NOT NULL AND inicio < ? AND fim > ? LIMIT 1",
      [usuarioId, ignorarId, fim, inicio]
    );
    return rows.length > 0;
  },
};

module.exports = SessaoModel;