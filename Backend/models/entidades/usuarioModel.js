const pool = require("../../acesso_dados/dbConnection");

const UsuarioModel = {
  buscarPorEmail: async (email) => {
    const [rows] = await pool.query("SELECT * FROM Usuario WHERE email = ?", [email]);
    return rows[0] || null;
  },

  buscarPorId: async (id) => {
    const [rows] = await pool.query(
      "SELECT id, nome, email, foto_perfil, criado_em FROM Usuario WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  },

  criar: async ({ nome, email, senha_hash }) => {
    const [result] = await pool.query(
      "INSERT INTO Usuario (nome, email, senha_hash) VALUES (?, ?, ?)",
      [nome, email, senha_hash]
    );
    return { id: result.insertId, nome, email };
  },

  atualizarPerfil: async (id, { nome, foto_perfil }) => {
    await pool.query("UPDATE Usuario SET nome = ?, foto_perfil = ? WHERE id = ?", [
      nome,
      foto_perfil,
      id,
    ]);
  },

  atualizarSenha: async (id, senha_hash) => {
    await pool.query("UPDATE Usuario SET senha_hash = ? WHERE id = ?", [senha_hash, id]);
  },

  // Recuperação de senha
  salvarCodigoRecuperacao: async (id, codigo_hash, minutos) => {
    await pool.query(
      "UPDATE Usuario SET codigo_recuperacao = ?, codigo_expira_em = DATE_ADD(NOW(), INTERVAL ? MINUTE), codigo_tentativas = 0 WHERE id = ?",
      [codigo_hash, minutos, id]
    );
  },

  buscarCodigoAtivo: async (id) => {
    const [rows] = await pool.query(
      "SELECT codigo_recuperacao, codigo_tentativas FROM Usuario WHERE id = ? AND codigo_recuperacao IS NOT NULL AND codigo_expira_em > NOW()",
      [id]
    );
    return rows[0] || null;
  },

  registrarTentativaCodigo: async (id) => {
    await pool.query("UPDATE Usuario SET codigo_tentativas = codigo_tentativas + 1 WHERE id = ?", [id]);
  },

  limparCodigoRecuperacao: async (id) => {
    await pool.query(
      "UPDATE Usuario SET codigo_recuperacao = NULL, codigo_expira_em = NULL, codigo_tentativas = 0 WHERE id = ?",
      [id]
    );
  },
};

module.exports = UsuarioModel;