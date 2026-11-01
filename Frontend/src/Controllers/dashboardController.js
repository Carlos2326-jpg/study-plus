import { useState, useEffect } from 'react';
import { dashboardService } from '../Services/dashboardService';
import { useAuth } from './authController';

export const useDashboard = () => {
  const { usuario } = useAuth();
  const [dados, setDados] = useState({ totalTarefas: 0, concluidas: 0, proximosEventos: [] });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const carregarPainel = async () => {
    if (!usuario) return;
    try {
      setLoading(true);
      const metricas = await dashboardService.obterMetricas(usuario.id);
      setDados(metricas);
    } catch (err) {
      setErro(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPainel();
  }, [usuario]);

  // Calcula a porcentagem de tarefas feitas para o gráfico/barra de progresso
  const porcentagemConclusao = dados.totalTarefas > 0 
    ? Math.round((dados.concluidas / dados.totalTarefas) * 180) / 1.8 // Limita ou formata em %
    : 0;

  return { dados, loading, erro, porcentagemConclusao, recarregar: carregarPainel };
};