import api from './api';

export const dashboardService = {
  obterMetricas: async (usuarioId) => {
    try {
      const response = await api.get(`/api/dashboard/metrica?usuario_id=${usuarioId}`);
      return response.data; // Espera receber: { totalTarefas: 8, concluidas: 5, proximosEventos: [...] }
    } catch (error) {
      throw error.response?.data?.message || 'Erro ao carregar dados do painel.';
    }
  }
};