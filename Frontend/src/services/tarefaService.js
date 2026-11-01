// ============================================================
// SERVICE - Área 2: Tarefas, Subtarefas, Cronogramas
// Study+
// ============================================================

import api from "./api.js";

// ============================================================
// TAREFAS
// ============================================================

export const tarefaService = {

  listar: async (filtros = {}) => {
    const response = await api.get("/tarefas", { params: filtros });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/tarefas/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/tarefas", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/tarefas/${id}`, dados);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/tarefas/${id}`);
    return response.data;
  },
};

// ============================================================
// SUBTAREFAS
// ============================================================

export const subtarefaService = {

  listarPorTarefa: async (tarefa_id) => {
    const response = await api.get(`/tarefas/${tarefa_id}/subtarefas`);
    return response.data;
  },

  criar: async (tarefa_id, titulo) => {
    const response = await api.post(`/tarefas/${tarefa_id}/subtarefas`, { titulo });
    return response.data;
  },

   atualizar: async (id, dados) => {
    const response = await api.put(`/tarefas/subtarefas/${id}`, dados);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/tarefas/subtarefas/${id}`);
    return response.data;
  },
};

// ============================================================
// CRONOGRAMAS
// ============================================================

export const cronogramaService = {

  listar: async (usuario_id) => {
    const response = await api.get("/cronogramas", { params: { usuario_id } });
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/cronogramas", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/cronogramas/${id}`, dados);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/cronogramas/${id}`);
    return response.data;
  },
};