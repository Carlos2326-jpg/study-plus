// ============================================================
// MODEL - Área 2: Tarefas, Subtarefas, Recorrência e Calendário
// Study+
// ============================================================

// Mock de usuário logado (virá da Área 1 futuramente)
export const usuarioAtual = {
  id: 1,
  nome: "Usuário Teste",
};

// Mock de disciplinas (virá da Área 1 futuramente)
export const disciplinas = [
  { id: 1, usuario_id: 1, nome: "Matemática", descricao: "Cálculo e Álgebra" },
  { id: 2, usuario_id: 1, nome: "Português", descricao: "Gramática e Redação" },
  { id: 3, usuario_id: 1, nome: "História", descricao: "História Geral" },
  { id: 4, usuario_id: 1, nome: "Inglês", descricao: "Língua Inglesa" },
];

// Mock de tarefas
export let tarefas = [
  {
    id: 1,
    usuario_id: 1,
    disciplina_id: 1,
    titulo: "Estudar integrais",
    prioridade: "alta",
    status: "pendente",
    prazo: "2026-06-15",
    criado_em: "2026-06-01",
  },
  {
    id: 2,
    usuario_id: 1,
    disciplina_id: 2,
    titulo: "Revisar redação",
    prioridade: "media",
    status: "em_andamento",
    prazo: "2026-06-10",
    criado_em: "2026-06-02",
  },
  {
    id: 3,
    usuario_id: 1,
    disciplina_id: 4,
    titulo: "Revisar inglês toda terça e quinta",
    prioridade: "baixa",
    status: "pendente",
    prazo: "2026-06-30",
    criado_em: "2026-06-03",
  },
];

// Mock de subtarefas
export let subtarefas = [
  { id: 1, tarefa_id: 1, titulo: "Ler capítulo 3", concluida: false },
  { id: 2, tarefa_id: 1, titulo: "Fazer exercícios pág 45", concluida: true },
  { id: 3, tarefa_id: 2, titulo: "Corrigir introdução", concluida: false },
];

// Mock de cronogramas (recorrência e calendário)
export let cronogramas = [
  {
    id: 1,
    usuario_id: 1,
    disciplina_id: 4,
    tarefa_id: 3,
    data: "2026-06-10",
    hora_inicio: "18:00",
    hora_fim: "19:00",
    recorrencia: "semanal",
  },
];

// ============================================================
// Estrutura base para criar nova tarefa
// ============================================================
export const novaTarefaBase = {
  id: null,
  usuario_id: 1,
  disciplina_id: null,
  titulo: "",
  prioridade: "media",
  status: "pendente",
  prazo: "",
  criado_em: "",
};

// Estrutura base para criar nova subtarefa
export const novaSubtarefaBase = {
  id: null,
  tarefa_id: null,
  titulo: "",
  concluida: false,
};

// Estrutura base para cronograma
export const novoCronogramaBase = {
  id: null,
  usuario_id: 1,
  disciplina_id: null,
  tarefa_id: null,
  data: "",
  hora_inicio: "",
  hora_fim: "",
  recorrencia: "nenhuma", // nenhuma | diaria | semanal | mensal
};