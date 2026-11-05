// ============================================================
// SERVICE - Área 3: Metas
// Study+
// ============================================================

import api from "./api";

// Mock local enquanto API não está pronta
export let metasMock = [
  {
    id: 1,
    usuario_id: 1,
    disciplina: "Matemática",
    carga_horaria_alvo: 20,
    data_inicio: "2026-06-01",
    data_fim: "2026-06-30",
    tipo: "horas",
    horas_cumpridas: 8,
  },
  {
    id: 2,
    usuario_id: 1,
    disciplina: "Português",
    carga_horaria_alvo: 10,
    data_inicio: "2026-06-01",
    data_fim: "2026-06-30",
    tipo: "tarefas",
    horas_cumpridas: 3,
  },
];

const USE_MOCK = false;

export const metaService = {
  listar: async () => {
    if (USE_MOCK) return { data: metasMock };
    return api.get("/metas");
  },

  buscarPorId: async (id) => {
    if (USE_MOCK) {
      const meta = metasMock.find((m) => m.id === id);
      return { data: meta };
    }
    return api.get(`/metas/${id}`);
  },

  criar: async (dados) => {
    if (USE_MOCK) {
      const nova = { ...dados, id: Date.now(), horas_cumpridas: 0 };
      metasMock.push(nova);
      return { data: nova };
    }
    return api.post("/metas", dados);
  },

  atualizar: async (id, dados) => {
    if (USE_MOCK) {
      const idx = metasMock.findIndex((m) => m.id === id);
      if (idx !== -1) metasMock[idx] = { ...metasMock[idx], ...dados };
      return { data: metasMock[idx] };
    }
    return api.put(`/metas/${id}`, dados);
  },

  excluir: async (id) => {
    if (USE_MOCK) {
      metasMock = metasMock.filter((m) => m.id !== id);
      return { data: { success: true } };
    }
    return api.delete(`/metas/${id}`);
  },

  buscarProgresso: async (id) => {
    if (USE_MOCK) {
      const meta = metasMock.find((m) => m.id === id);
      if (!meta) return { data: { percentual: 0 } };
      const percentual = Math.min(
        100,
        Math.round((meta.horas_cumpridas / meta.carga_horaria_alvo) * 100)
      );
      return { data: { percentual, meta } };
    }
    return api.get(`/metas/${id}/progresso`);
  },
};