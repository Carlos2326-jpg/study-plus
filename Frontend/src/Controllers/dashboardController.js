import { useState, useEffect } from 'react';
import { dashboardService } from '../Services/dashboardService';
import { useAuth } from './authController';

const PAINEL_VAZIO = {
  totalTarefas: 0,
  concluidas: 0,
  pendentes: 0,
  emAndamento: 0,
  bloqueadas: 0,
  atrasadas: 0,
  percentualConcluido: 0,
  horasSemana: 0,
  horasMes: 0,
  metas: { total: 0, ativas: 0, atingidas: 0 },
  proximosEventos: [],
};

export const useDashboard = () => {
  const { usuario } = useAuth();
  const [dados, setDados] = useState(PAINEL_VAZIO);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const carregarPainel = async () => {
    if (!usuario) return;
    try {
      setLoading(true);
      const metricas = await dashboardService.obterMetricas(usuario.id);
      setDados({ ...PAINEL_VAZIO, ...metricas });
    } catch (err) {
      setErro(typeof err === 'string' ? err : 'Erro ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPainel();
  }, [usuario]);

  // O servidor já calcula o percentual de tarefas concluídas
  const porcentagemConclusao = dados.percentualConcluido ?? 0;

  return { dados, loading, erro, porcentagemConclusao, recarregar: carregarPainel };
};