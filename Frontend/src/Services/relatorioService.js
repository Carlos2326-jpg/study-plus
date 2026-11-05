// ============================================================
// SERVICE - Área 3: Relatórios e Produtividade
// Study+
// ============================================================

import api from "./api";
import { sessoesMock } from "./estudoService";
import { metasMock } from "./metaService";

const USE_MOCK = false;

export const relatorioService = {
  buscarProdutividade: async (filtros = {}) => {
    if (USE_MOCK) {
      const sessoesFiltradas = sessoesMock.filter((s) => {
        if (filtros.disciplina && s.disciplina !== filtros.disciplina) return false;
        return true;
      });

      const totalMinutos = sessoesFiltradas.reduce(
        (acc, s) => acc + (s.duracao_minutos || 0),
        0
      );

      return {
        data: {
          totalHoras: +(totalMinutos / 60).toFixed(1),
          totalSessoes: sessoesFiltradas.length,
          sessoes: sessoesFiltradas,
        },
      };
    }
    return api.get("/relatorios/produtividade", { params: filtros });
  },

  buscarDadosGraficos: async (filtros = {}) => {
    if (USE_MOCK) {
      const porDisciplina = sessoesMock.reduce((acc, s) => {
        const key = s.disciplina;
        if (!acc[key]) acc[key] = 0;
        acc[key] += s.duracao_minutos || 0;
        return acc;
      }, {});

      const barras = Object.entries(porDisciplina).map(([disciplina, minutos]) => ({
        disciplina,
        horas: +(minutos / 60).toFixed(1),
      }));

      const pizza = barras.map((item) => ({
        name: item.disciplina,
        value: item.horas,
      }));

      const progresso = metasMock.map((meta) => ({
        disciplina: meta.disciplina,
        alvo: meta.carga_horaria_alvo,
        cumprido: meta.horas_cumpridas,
        percentual: Math.min(
          100,
          Math.round((meta.horas_cumpridas / meta.carga_horaria_alvo) * 100)
        ),
      }));

      return { data: { barras, pizza, progresso } };
    }
    return api.get("/relatorios/graficos", { params: filtros });
  },
};