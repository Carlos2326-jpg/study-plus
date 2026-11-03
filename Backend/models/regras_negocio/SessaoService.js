const SessaoModel = require("../entidades/sessaoModel");
const TarefaModel = require("../entidades/tarefaModel");
const ErroNegocio = require("./ErroNegocio");

const INATIVIDADE_SEG = 120; // sem sinal do navegador por 2 min => sessão pausada
const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HORA_REGEX = /^\d{2}:\d{2}$/;

const texto = (v) => String(v ?? "").trim();
const vazio = (v) => v === undefined || v === null || v === "";
const p2 = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const dataHora = (d) => `${ymd(d)} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;

// Remove os campos auxiliares e acrescenta o tempo total atual em segundos
function limpar(s) {
  if (!s) return null;
  const { segundos_trecho, segundos_desde_ping, segundos_desde_inicio, ...resto } = s;
  const correndo = s.estado === "em_andamento" && segundos_trecho > 0 ? segundos_trecho : 0;
  return { ...resto, tempo_segundos: Number(s.acumulado_segundos) + correndo };
}

// CU04 4.a: se o navegador parou de avisar, pausa a sessão com o tempo até o último sinal
async function sincronizar(s) {
  if (s && s.estado === "em_andamento" && s.ultimo_ping && s.segundos_desde_ping > INATIVIDADE_SEG) {
    const trecho = Math.max(0, s.segundos_trecho - s.segundos_desde_ping);
    await SessaoModel.pausar(s.id, s.usuario_id, Number(s.acumulado_segundos) + trecho);
    return SessaoModel.buscarPorId(s.id, s.usuario_id);
  }
  return s;
}

async function buscarOuFalhar(id, usuarioId) {
  const s = await SessaoModel.buscarPorId(id, usuarioId);
  if (!s) throw new ErroNegocio(404, "Sessão não encontrada.");
  return sincronizar(s);
}

const recarregar = async (id, usuarioId) => limpar(await SessaoModel.buscarPorId(id, usuarioId));

async function validarBasico(usuarioId, d) {
  const disciplina = texto(d.disciplina);
  if (!disciplina) throw new ErroNegocio(400, "Selecione a disciplina.");
  if (disciplina.length > 100) throw new ErroNegocio(400, "Nome da disciplina muito longo.");

  let tarefa_id = null;
  if (!vazio(d.tarefa_id)) {
    tarefa_id = Number(d.tarefa_id);
    if (!Number.isInteger(tarefa_id) || !(await TarefaModel.buscarPorId(tarefa_id, usuarioId)))
      throw new ErroNegocio(400, "Tarefa inválida.");
  }
  return {
    disciplina,
    tecnica_usada: texto(d.tecnica_usada) || "cronometro",
    tarefa_id,
    anotacao: texto(d.anotacao),
  };
}

function inteiroEntre(valor, padrao, min, max, nome) {
  if (vazio(valor)) return padrao;
  const n = Number(valor);
  if (!Number.isInteger(n) || n < min || n > max)
    throw new ErroNegocio(400, `${nome} deve ser um número inteiro entre ${min} e ${max}.`);
  return n;
}

// Período de um registro manual: por horários (início e fim) ou só pela duração
function periodoManual(d) {
  const data = vazio(d.data) ? null : texto(d.data);
  if (data && !DATA_REGEX.test(data)) throw new ErroNegocio(400, "Data inválida. Use AAAA-MM-DD.");
  if (data && data > ymd(new Date())) throw new ErroNegocio(400, "A data não pode estar no futuro.");

  if (!vazio(d.hora_inicio) || !vazio(d.hora_fim)) {
    if (!data) throw new ErroNegocio(400, "Informe a data do registro.");
    const hi = texto(d.hora_inicio);
    const hf = texto(d.hora_fim);
    if (!HORA_REGEX.test(hi) || !HORA_REGEX.test(hf))
      throw new ErroNegocio(400, "Horários inválidos. Use HH:MM.");
    const minutos = Math.round((new Date(`${data}T${hf}:00`) - new Date(`${data}T${hi}:00`)) / 60000);
    if (minutos <= 0) throw new ErroNegocio(400, "O horário de término deve ser posterior ao de início.");
    return { inicio: `${data} ${hi}:00`, fim: `${data} ${hf}:00`, duracao_minutos: minutos, checarSobreposicao: true };
  }

  const n = Number(d.duracao_minutos);
  if (!Number.isFinite(n) || n < 1 || n > 1440)
    throw new ErroNegocio(400, "Informe uma duração entre 1 e 1440 minutos.");
  const duracao = Math.round(n);

  let inicio, fim;
  if (data) {
    inicio = new Date(`${data}T00:00:00`);
    fim = new Date(inicio.getTime() + duracao * 60000);
  } else {
    fim = new Date();
    inicio = new Date(fim.getTime() - duracao * 60000);
  }
  return { inicio: dataHora(inicio), fim: dataHora(fim), duracao_minutos: duracao, checarSobreposicao: false };
}

const MSG_SOBREPOSICAO = "Já existe um registro de estudo neste horário.";

// ---------- Cronômetro e Pomodoro ----------
async function iniciar(usuarioId, dados) {
  const base = await validarBasico(usuarioId, dados);

  const pomodoro = base.tecnica_usada === "pomodoro";
  const config = {
    foco_min: pomodoro ? inteiroEntre(dados.foco_min, 25, 1, 180, "O tempo de foco") : null,
    pausa_min: pomodoro ? inteiroEntre(dados.pausa_min, 5, 1, 60, "O tempo de intervalo") : null,
    blocos_planejados: pomodoro ? inteiroEntre(dados.blocos, 4, 1, 20, "A quantidade de blocos") : null,
  };

  // Só uma sessão ativa por vez: encerra automaticamente uma que tenha ficado pendente
  const pendente = await SessaoModel.buscarAtiva(usuarioId);
  if (pendente) {
    const s = await sincronizar(pendente);
    const correndo = s.estado === "em_andamento" && s.ultimo_ping ? Math.max(0, s.segundos_trecho) : 0;
    const acumulado = Number(s.acumulado_segundos) + correndo;
    await SessaoModel.encerrar(s.id, usuarioId, {
      acumulado,
      duracao: Math.round(acumulado / 60),
      anotacao: s.anotacao || "Encerrada automaticamente.",
    });
  }

  const id = await SessaoModel.iniciar(usuarioId, { ...base, ...config });
  return recarregar(id, usuarioId);
}

async function obterAtiva(usuarioId) {
  const ativa = await SessaoModel.buscarAtiva(usuarioId);
  if (!ativa) return null;
  const s = await sincronizar(ativa);
  return limpar(s);
}

async function pausar(id, usuarioId) {
  const s = await buscarOuFalhar(id, usuarioId);
  if (s.estado !== "em_andamento") throw new ErroNegocio(409, "A sessão não está em andamento.");
  await SessaoModel.pausar(id, usuarioId, Number(s.acumulado_segundos) + Math.max(0, s.segundos_trecho));
  return recarregar(id, usuarioId);
}

async function retomar(id, usuarioId) {
  const s = await buscarOuFalhar(id, usuarioId);
  if (s.estado !== "pausada") throw new ErroNegocio(409, "A sessão não está pausada.");
  await SessaoModel.retomar(id, usuarioId);
  return recarregar(id, usuarioId);
}

async function ping(id, usuarioId) {
  const s = await buscarOuFalhar(id, usuarioId);
  if (s.estado === "em_andamento") await SessaoModel.ping(id, usuarioId);
  return recarregar(id, usuarioId);
}

async function registrarBloco(id, usuarioId) {
  const s = await buscarOuFalhar(id, usuarioId);
  if (s.estado === "encerrada") throw new ErroNegocio(409, "A sessão já foi encerrada.");
  if (s.tecnica_usada !== "pomodoro") throw new ErroNegocio(400, "Esta sessão não usa Pomodoro.");
  if (s.blocos_concluidos >= s.blocos_planejados)
    throw new ErroNegocio(409, "Todos os blocos planejados já foram concluídos.");
  await SessaoModel.registrarBloco(id, usuarioId);
  return recarregar(id, usuarioId);
}

async function finalizar(id, usuarioId, dados = {}) {
  const s = await buscarOuFalhar(id, usuarioId);
  if (s.estado === "encerrada") throw new ErroNegocio(409, "A sessão já foi encerrada.");

  let acumulado = Number(s.acumulado_segundos) + (s.estado === "em_andamento" ? Math.max(0, s.segundos_trecho) : 0);
  let duracao = Math.round(acumulado / 60);

  // Compatibilidade: o frontend atual mede o tempo sozinho e envia a duração.
  // Só aceita se nunca houve pausa/sinal pelo servidor, e nunca acima do tempo real decorrido.
  if (!vazio(dados.duracao_minutos) && s.pausas === 0 && !s.ultimo_ping) {
    const enviado = Number(dados.duracao_minutos);
    if (!Number.isFinite(enviado) || enviado < 0) throw new ErroNegocio(400, "Duração inválida.");
    duracao = Math.min(Math.round(enviado), Math.ceil(s.segundos_desde_inicio / 60) + 1);
    acumulado = duracao * 60;
  }

  await SessaoModel.encerrar(id, usuarioId, { acumulado, duracao, anotacao: texto(dados.anotacao) });
  return recarregar(id, usuarioId);
}

// ---------- Registros ----------
async function listar(usuarioId) {
  return (await SessaoModel.listar(usuarioId)).map(limpar);
}

async function registrarManual(usuarioId, dados) {
  const base = await validarBasico(usuarioId, dados);
  const periodo = periodoManual(dados);
  if (periodo.checarSobreposicao && (await SessaoModel.haSobreposicao(usuarioId, periodo.inicio, periodo.fim)))
    throw new ErroNegocio(409, MSG_SOBREPOSICAO);

  const id = await SessaoModel.criarRegistro(usuarioId, { ...base, ...periodo });
  return recarregar(id, usuarioId);
}

async function editar(id, usuarioId, dados) {
  const s = await buscarOuFalhar(id, usuarioId);
  if (s.estado !== "encerrada") throw new ErroNegocio(409, "Só é possível editar sessões encerradas.");

  let campos = await validarBasico(usuarioId, { ...s, ...dados });

  const mudaPeriodo = ["data", "hora_inicio", "hora_fim", "duracao_minutos"].some((k) => !vazio(dados[k]));
  if (mudaPeriodo) {
    const p = periodoManual(dados);
    if (p.checarSobreposicao && (await SessaoModel.haSobreposicao(usuarioId, p.inicio, p.fim, id)))
      throw new ErroNegocio(409, MSG_SOBREPOSICAO);
    campos = {
      ...campos,
      inicio: p.inicio,
      fim: p.fim,
      duracao_minutos: p.duracao_minutos,
      acumulado_segundos: p.duracao_minutos * 60,
    };
  }

  await SessaoModel.atualizarRegistro(id, usuarioId, campos);
  return recarregar(id, usuarioId);
}

async function excluir(id, usuarioId) {
  await buscarOuFalhar(id, usuarioId);
  await SessaoModel.excluir(id, usuarioId);
  return { mensagem: "Registro excluído com sucesso." };
}

module.exports = {
  listar, obterAtiva, iniciar, pausar, retomar, ping, registrarBloco, finalizar,
  registrarManual, editar, excluir,
};