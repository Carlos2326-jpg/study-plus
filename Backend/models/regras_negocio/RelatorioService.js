const Consultas = require("../../acesso_dados/consultas/relatorioConsultas");
const MetaService = require("./metaService");
const ErroNegocio = require("./ErroNegocio");

const PERIODOS = { semana: 6, mes: 29, ano: 364 }; // dias para trás, contando hoje
const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const horas = (min) => Math.round((min / 60) * 100) / 100;
const pct = (parte, total) => (total > 0 ? Math.round((parte / total) * 1000) / 10 : 0);

function ymd(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const textoData = (v) => (v instanceof Date ? ymd(v) : String(v).slice(0, 10));

// Converte ?periodo=semana|mes|ano ou ?data_inicio&data_fim em { inicio, fim }
function intervalo(q = {}) {
  if (q.periodo) {
    if (!(q.periodo in PERIODOS)) throw new ErroNegocio(400, "Período inválido. Use semana, mes ou ano.");
    const ini = new Date();
    ini.setDate(ini.getDate() - PERIODOS[q.periodo]);
    return { inicio: ymd(ini), fim: ymd(new Date()) };
  }
  for (const campo of ["data_inicio", "data_fim"]) {
    if (q[campo] && !DATA_REGEX.test(q[campo]))
      throw new ErroNegocio(400, `Data inválida em ${campo}. Use AAAA-MM-DD.`);
  }
  return { inicio: q.data_inicio || null, fim: q.data_fim || null };
}

function diasEntre(inicio, fim) {
  const lista = [];
  const d = new Date(`${inicio}T00:00:00`);
  const f = new Date(`${fim}T00:00:00`);
  while (d <= f) {
    lista.push(ymd(d));
    d.setDate(d.getDate() + 1);
  }
  return lista;
}

// ---------- Painel de resumo (FS09) ----------
async function dashboard(usuarioId) {
  const [porEstado, atrasadas, cronogramas, prazos, minSemana, minMes, metas] = await Promise.all([
    Consultas.tarefasPorEstado(usuarioId),
    Consultas.tarefasAtrasadas(usuarioId),
    Consultas.proximosCronogramas(usuarioId, 5),
    Consultas.proximosPrazos(usuarioId, 5),
    Consultas.minutosTotais(usuarioId, intervalo({ periodo: "semana" })),
    Consultas.minutosTotais(usuarioId, intervalo({ periodo: "mes" })),
    MetaService.listar(usuarioId),
  ]);

  const contagem = Object.fromEntries(porEstado.map((r) => [r.estado, Number(r.total)]));
  const totalTarefas = porEstado.reduce((soma, r) => soma + Number(r.total), 0);
  const concluidas = contagem.concluida || 0;

  const hhmm = (h) => (h ? String(h).slice(0, 5) : "");
  const eventosCronograma = cronogramas.map((c) => {
    const nome = c.disciplina || "Estudo";
    return {
      id: `c${c.id}`,
      titulo: c.hora_inicio && c.hora_fim ? `${nome} - ${hhmm(c.hora_inicio)} às ${hhmm(c.hora_fim)}` : nome,
      data: c.data,
    };
  });
  const eventosTarefas = prazos.map((t) => ({ id: `t${t.id}`, titulo: `Prazo: ${t.titulo}`, data: t.prazo }));
  const proximosEventos = [...eventosCronograma, ...eventosTarefas]
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .slice(0, 5);

  const hoje = ymd(new Date());
  const metasResumo = {
    total: metas.length,
    ativas: metas.filter((m) => textoData(m.data_fim) >= hoje).length,
    atingidas: metas.filter(
      (m) => Number(m.carga_horaria_alvo) > 0 && m.horas_cumpridas >= Number(m.carga_horaria_alvo)
    ).length,
  };

  return {
    totalTarefas,
    concluidas,
    pendentes: contagem.pendente || 0,
    emAndamento: contagem.em_andamento || 0,
    bloqueadas: contagem.bloqueada || 0,
    atrasadas,
    percentualConcluido: pct(concluidas, totalTarefas),
    horasSemana: horas(minSemana),
    horasMes: horas(minMes),
    metas: metasResumo,
    proximosEventos,
  };
}

// ---------- Relatório de desempenho (FS07) ----------
async function produtividade(usuarioId, query = {}) {
  const periodo = intervalo(query);
  const filtros = { ...periodo, disciplina: query.disciplina || null };

  const [sessoes, minutos, porDisciplina, porEstado] = await Promise.all([
    Consultas.sessoes(usuarioId, filtros),
    Consultas.minutosTotais(usuarioId, filtros),
    Consultas.minutosPorDisciplina(usuarioId, filtros),
    Consultas.tarefasPorEstado(usuarioId),
  ]);

  const totalTarefas = porEstado.reduce((soma, r) => soma + Number(r.total), 0);
  const tarefasConcluidas = Number(porEstado.find((r) => r.estado === "concluida")?.total || 0);

  const distribuicao = porDisciplina.map((r) => ({
    disciplina: r.disciplina,
    horas: horas(Number(r.minutos)),
    percentual: pct(Number(r.minutos), minutos),
  }));

  return {
    periodo,
    totalHoras: horas(minutos),
    totalSessoes: sessoes.length,
    sessoes,
    tarefasConcluidas,
    totalTarefas,
    distribuicao,
    disciplinaMaisEstudada: distribuicao[0]?.disciplina || null,
    semDados: sessoes.length === 0,
    mensagem: sessoes.length === 0 ? "Não há dados de estudo para o período selecionado." : null,
  };
}

// ---------- Gráficos e estatísticas (FS08) ----------
async function graficos(usuarioId, query = {}) {
  const filtros = intervalo(query);
  // A evolução precisa de um intervalo fechado: sem filtro, usa os últimos 30 dias
  const janela = filtros.inicio && filtros.fim ? filtros : intervalo({ periodo: "mes" });

  const [porDisciplina, porDia, porEstado, metas] = await Promise.all([
    Consultas.minutosPorDisciplina(usuarioId, filtros),
    Consultas.minutosPorDia(usuarioId, janela),
    Consultas.tarefasPorEstado(usuarioId),
    MetaService.listar(usuarioId),
  ]);

  const barras = porDisciplina.map((r) => ({ disciplina: r.disciplina, horas: horas(Number(r.minutos)) }));
  const pizza = barras.map((b) => ({ name: b.disciplina, value: b.horas }));

  const progresso = metas.map((m) => ({
    disciplina: m.disciplina,
    alvo: m.carga_horaria_alvo,
    cumprido: m.horas_cumpridas,
    percentual: MetaService.calcularPercentual(m.horas_cumpridas, m.carga_horaria_alvo),
  }));

  const mapaDia = Object.fromEntries(porDia.map((r) => [r.dia, Number(r.minutos)]));
  const evolucao = diasEntre(janela.inicio, janela.fim).map((dia) => ({
    data: dia,
    horas: horas(mapaDia[dia] || 0),
  }));

  const tarefasPorEstado = porEstado.map((r) => ({ estado: r.estado, total: Number(r.total) }));

  return { barras, pizza, progresso, evolucao, tarefasPorEstado };
}

module.exports = { dashboard, produtividade, graficos };