import api from "./api";

export let cronogramasMock = [
  {
    id: 1,
    usuario_id: 1,
    disciplina: "Matemática",
    data_inicio: "2026-06-01",
    data_fim: "2026-06-30",
    horario_inicio: "19:00",
    horario_fim: "21:00",
    recorrencia: "semanal",
  },
];

export let sessoesMock = [
  {
    id: 1,
    usuario_id: 1,
    disciplina: "Matemática",
    tecnica_usada: "pomodoro",
    inicio: "2026-06-10T19:00:00",
    fim: "2026-06-10T20:30:00",
    duracao_minutos: 90,
    anotacao: "Revisão de integrais",
    tarefa_id: null,
  },
    {
    id: 2,
    usuario_id: 1,
    disciplina: "Português",
    tecnica_usada: "time_blocking",
    inicio: "2026-06-11T14:00:00",
    fim: "2026-06-11T15:00:00",
    duracao_minutos: 60,
    anotacao: "Revisão de gramática",
    tarefa_id: null,
  },
];

const USE_MOCK = false;

export const estudoService = {
  // Cronogramas
  listarCronogramas: async () => {
    if (USE_MOCK) return { data: cronogramasMock };
    return api.get("/cronogramas");
  },

  criarCronograma: async (dados) => {
    if (USE_MOCK) {
      const novo = { ...dados, id: Date.now() };
      cronogramasMock.push(novo);
      return { data: novo };
    }
    return api.post("/cronogramas", dados);
  },

  atualizarCronograma: async (id, dados) => {
    if (USE_MOCK) {
      const idx = cronogramasMock.findIndex((c) => c.id === id);
      if (idx !== -1) cronogramasMock[idx] = { ...cronogramasMock[idx], ...dados };
      return { data: cronogramasMock[idx] };
    }
    return api.put(`/cronogramas/${id}`, dados);
  },

  excluirCronograma: async (id, serie = false) => {
    if (USE_MOCK) {
      cronogramasMock = cronogramasMock.filter((c) => c.id !== id);
      return { data: { success: true } };
    }
    return api.delete(`/cronogramas/${id}`, { params: serie ? { serie: true } : {} });
  },

  validarConflito: async (dados) => {
    if (USE_MOCK) {
      const conflito = cronogramasMock.some(
        (c) =>
          c.disciplina === dados.disciplina &&
          c.horario_inicio < dados.horario_fim &&
          c.horario_fim > dados.horario_inicio
      );
      return { data: { conflito } };
    }
    return api.post("/cronogramas/validar-conflito", dados);
  },

  // Sessões
  listarSessoes: async () => {
    if (USE_MOCK) return { data: sessoesMock };
    return api.get("/sessoes");
  },

  iniciarSessao: async (dados) => {
    if (USE_MOCK) {
      const nova = { ...dados, id: Date.now(), inicio: new Date().toISOString(), fim: null };
      sessoesMock.push(nova);
      return { data: nova };
    }
    return api.post("/sessoes", dados);
  },

  finalizarSessao: async (id, duracao_minutos, anotacao = "") => {
    if (USE_MOCK) {
      const idx = sessoesMock.findIndex((s) => s.id === id);
      if (idx !== -1) {
        sessoesMock[idx] = {
          ...sessoesMock[idx],
          fim: new Date().toISOString(),
          duracao_minutos,
          anotacao,
        };
      }
      return { data: sessoesMock[idx] };
    }
    return api.put(`/sessoes/${id}/finalizar`, { duracao_minutos, anotacao });
  },

  registrarTempoManual: async (dados) => {
    if (USE_MOCK) {
      const nova = { ...dados, id: Date.now() };
      sessoesMock.push(nova);
      return { data: nova };
    }
    return api.post("/registros-tempo/manual", dados);
  },

  sessaoAtiva: () => api.get("/sessoes/ativa"),
  pausarSessao: (id) => api.put(`/sessoes/${id}/pausar`),
  retomarSessao: (id) => api.put(`/sessoes/${id}/retomar`),
  pingSessao: (id) => api.put(`/sessoes/${id}/ping`),
  registrarBloco: (id) => api.put(`/sessoes/${id}/bloco`),
  encerrarSessao: (id, anotacao = "") => api.put(`/sessoes/${id}/finalizar`, { anotacao }),
};