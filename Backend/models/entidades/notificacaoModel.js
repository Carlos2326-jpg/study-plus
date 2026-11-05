const pool = require("../../acesso_dados/dbConnection");

const NotificacaoModel = {
  // Tarefas não concluídas, atrasadas ou com prazo dentro da janela de alerta
  tarefasComAlerta: async (usuarioId, diasAlerta) => {
    const [rows] = await pool.query(
      `SELECT id, titulo, prazo, status, DATEDIFF(prazo, CURDATE()) AS dias
         FROM Tarefa
        WHERE usuario_id = ?
          AND prazo IS NOT NULL
          AND (status IS NULL OR status <> 'concluida')
          AND DATEDIFF(prazo, CURDATE()) <= ?
        ORDER BY prazo ASC`,
      [usuarioId, diasAlerta]
    );
    return rows;
  },

  // Metas que terminam em breve ou terminaram há pouco tempo
  metasComAlerta: async (usuarioId, diasAlerta, diasVencida) => {
    const [rows] = await pool.query(
      `SELECT *, DATEDIFF(data_fim, CURDATE()) AS dias
         FROM Meta
        WHERE usuario_id = ?
          AND DATEDIFF(data_fim, CURDATE()) <= ?
          AND DATEDIFF(data_fim, CURDATE()) >= ?
        ORDER BY data_fim ASC`,
      [usuarioId, diasAlerta, -diasVencida]
    );
    return rows;
  },
};

module.exports = NotificacaoModel;