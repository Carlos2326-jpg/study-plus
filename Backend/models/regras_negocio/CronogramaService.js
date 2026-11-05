const crypto = require("crypto");
const CronogramaModel = require("../entidades/cronogramaModel");
const DisciplinaModel = require("../entidades/disciplinaModel");
const TarefaModel = require("../entidades/tarefaModel");
const ErroNegocio = require("./ErroNegocio");

const RECORRENCIAS = ["nenhuma", "diaria", "semanal"];
const MAX_OCORRENCIAS = 366;
const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HORA_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;

const vazio = (v) => v === undefined || v === null || v === "";
const p2 = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const hhmm = (h) => String(h).slice(0, 5);
const dataBR = (d) => d.split("-").reverse().join("/");

function dataValida(s) {
  if (!DATA_REGEX.test(s)) return false;
  const d = new Date(`${s}T00:00:00`);
  return !Number.isNaN(d.getTime()) && ymd(d) === s;
}

// Lista as datas das ocorrências entre início e fim
function gerarDatas(inicio, fim, recorrencia) {
  if (recorrencia === "nenhuma") {
    if (fim !== inicio)
      throw new ErroNegocio(
        400,
        "Para usar uma data de fim diferente da de início, escolha recorrência diária ou semanal."
      );
    return [inicio];
  }
  const passo = recorrencia === "diaria" ? 1 : 7;
  const datas = [];
  const d = new Date(`${inicio}T00:00:00`);
  const limite = new Date(`${fim}T00:00:00`);
  while (d <= limite) {
    datas.push(ymd(d));
    if (datas.length > MAX_OCORRENCIAS)
      throw new ErroNegocio(400, `O período gera mais de ${MAX_OCORRENCIAS} ocorrências. Reduza o intervalo.`);
    d.setDate(d.getDate() + passo);
  }
  return datas;
}

// Aceita o formato do Planejamento (data_inicio, data_fim, horario_*) e o do Calendário (data, hora_*)
async function normalizar(usuarioId, b) {
  const inicio = b.data_inicio || b.data;
  if (!inicio) throw new ErroNegocio(400, "Data é obrigatória.");
  const fim = b.data_fim || inicio;
  if (!dataValida(inicio) || !dataValida(fim)) throw new ErroNegocio(400, "Data inválida. Use AAAA-MM-DD.");
  if (fim < inicio) throw new ErroNegocio(400, "A data de fim não pode ser anterior à data de início.");

  const recorrencia = b.recorrencia || "nenhuma";
  if (!RECORRENCIAS.includes(recorrencia)) throw new ErroNegocio(400, "Recorrência inválida.");

  let hi = b.hora_inicio || b.horario_inicio || null;
  let hf = b.hora_fim || b.horario_fim || null;
  if (!!hi !== !!hf) throw new ErroNegocio(400, "Informe o horário de início e o de fim.");
  if (hi) {
    if (!HORA_REGEX.test(hi) || !HORA_REGEX.test(hf)) throw new ErroNegocio(400, "Horário inválido. Use HH:MM.");
    hi = hhmm(hi);
    hf = hhmm(hf);
    if (hf <= hi) throw new ErroNegocio(400, "O horário de fim deve ser posterior ao de início.");
  }

  let disciplina_id = null;
  if (!vazio(b.disciplina_id)) {
    const d = await DisciplinaModel.buscarPorId(Number(b.disciplina_id), usuarioId);
    if (!d) throw new ErroNegocio(400, "Disciplina inválida.");
    disciplina_id = d.id;
  } else if (!vazio(b.disciplina)) {
    const d = await DisciplinaModel.buscarPorNome(String(b.disciplina).trim(), usuarioId);
    if (!d) throw new ErroNegocio(400, "Disciplina não encontrada.");
    disciplina_id = d.id;
  }

  let tarefa_id = null;
  if (!vazio(b.tarefa_id)) {
    const t = await TarefaModel.buscarPorId(Number(b.tarefa_id), usuarioId);
    if (!t) throw new ErroNegocio(400, "Tarefa inválida.");
    tarefa_id = t.id;
  }

  return { inicio, fim, recorrencia, hora_inicio: hi, hora_fim: hf, disciplina_id, tarefa_id };
}

async function checarConflitos(usuarioId, datas, hi, hf, ignorarId = 0) {
  if (!hi || !hf) return null;
  return CronogramaModel.primeiroConflito(usuarioId, datas, hi, hf, ignorarId);
}

async function buscarOuFalhar(id, usuarioId) {
  const c = await CronogramaModel.buscarPorId(id, usuarioId);
  if (!c) throw new ErroNegocio(404, "Cronograma não encontrado.");
  return c;
}

async function listar(usuarioId) {
  return CronogramaModel.listar(usuarioId);
}

async function criar(usuarioId, body) {
  const c = await normalizar(usuarioId, body);
  const datas = gerarDatas(c.inicio, c.fim, c.recorrencia);

  const conflito = await checarConflitos(usuarioId, datas, c.hora_inicio, c.hora_fim);
  if (conflito)
    throw new ErroNegocio(409, `Conflito de horário com outro cronograma em ${dataBR(conflito)}.`);

  const serie = datas.length > 1 ? crypto.randomUUID() : null;
  const linhas = datas.map((data) => [
    usuarioId, c.disciplina_id, c.tarefa_id, data, c.hora_inicio, c.hora_fim, c.recorrencia, serie,
  ]);
  const primeiroId = await CronogramaModel.criarVarios(linhas);

  const primeiro = await CronogramaModel.buscarPorId(primeiroId, usuarioId);
  return { ...primeiro, ocorrencias: datas.length };
}

// Cada registro é UMA data: editar altera só esta ocorrência
async function atualizar(id, usuarioId, body) {
  const atual = await buscarOuFalhar(id, usuarioId);

  const mesclado = {
    data: atual.data,
    hora_inicio: atual.hora_inicio,
    hora_fim: atual.hora_fim,
    recorrencia: atual.recorrencia,
    disciplina_id: atual.disciplina_id,
    tarefa_id: atual.tarefa_id,
    ...body,
  };
  // Se veio o nome da disciplina (Planejamento), ele prevalece sobre o id antigo
  if (body.disciplina !== undefined && body.disciplina_id === undefined) mesclado.disciplina_id = null;
    // O Planejamento envia horario_*; eles devem prevalecer sobre os valores antigos
  if (body.horario_inicio !== undefined) mesclado.hora_inicio = body.horario_inicio;
  if (body.horario_fim !== undefined) mesclado.hora_fim = body.horario_fim;

  const c = await normalizar(usuarioId, mesclado);
  if (c.fim !== c.inicio)
    throw new ErroNegocio(
      400,
      "Cada cronograma representa uma única data. Para várias datas, crie um novo cronograma com recorrência."
    );

  const conflito = await checarConflitos(usuarioId, [c.inicio], c.hora_inicio, c.hora_fim, id);
  if (conflito)
    throw new ErroNegocio(409, `Conflito de horário com outro cronograma em ${dataBR(conflito)}.`);

  await CronogramaModel.atualizar(id, usuarioId, {
    disciplina_id: c.disciplina_id,
    tarefa_id: c.tarefa_id,
    data: c.inicio,
    hora_inicio: c.hora_inicio,
    hora_fim: c.hora_fim,
    recorrencia: c.recorrencia,
  });
  return CronogramaModel.buscarPorId(id, usuarioId);
}

// Com serie = true, exclui todas as ocorrências do mesmo planejamento
async function excluir(id, usuarioId, serie = false) {
  const c = await buscarOuFalhar(id, usuarioId);
  if (serie && c.serie_id) {
    await CronogramaModel.excluirSerie(c.serie_id, usuarioId);
    return { mensagem: "Série de cronogramas excluída com sucesso." };
  }
  await CronogramaModel.excluir(id, usuarioId);
  return { mensagem: "Cronograma excluído com sucesso." };
}

// O frontend chama antes de criar. Erros de formulário ficam para a criação reportar.
async function validarConflito(usuarioId, body) {
  try {
    const c = await normalizar(usuarioId, body);
    const datas = gerarDatas(c.inicio, c.fim, c.recorrencia);
    const data = await checarConflitos(usuarioId, datas, c.hora_inicio, c.hora_fim, Number(body.ignorar_id) || 0);
    return { conflito: !!data, data };
  } catch (err) {
    if (err instanceof ErroNegocio && err.status === 400) return { conflito: false };
    throw err;
  }
}

module.exports = { listar, criar, atualizar, excluir, validarConflito };