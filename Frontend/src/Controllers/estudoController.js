import { estudoService } from "../Services/estudoService";

function validarCronograma(dados) {
  const erros = [];
  if (!dados.disciplina) erros.push("Disciplina é obrigatória");
  if (!dados.horario_inicio) erros.push("Horário de início é obrigatório");
  if (!dados.horario_fim) erros.push("Horário de fim é obrigatório");
  if (dados.horario_inicio && dados.horario_fim && dados.horario_inicio >= dados.horario_fim)
    erros.push("Horário de início deve ser anterior ao horário de fim");
  if (!dados.data_inicio) erros.push("Data de início é obrigatória");
  return erros;
}

function validarSessao(dados) {
  const erros = [];
  if (!dados.disciplina) erros.push("Disciplina é obrigatória");
  if (!dados.tecnica_usada) erros.push("Técnica é obrigatória");
  return erros;
}

// Cronogramas
export async function listarCronogramas() {
  const res = await estudoService.listarCronogramas();
  return res.data;
}

// O servidor valida conflitos por data e devolve a mensagem exata
export async function criarCronograma(dados) {
  const erros = validarCronograma(dados);
  if (erros.length) throw new Error(erros.join(", "));
  const res = await estudoService.criarCronograma(dados);
  return res.data; // inclui "ocorrencias" (quantidade criada)
}

export async function atualizarCronograma(id, dados) {
  const erros = validarCronograma(dados);
  if (erros.length) throw new Error(erros.join(", "));
  const res = await estudoService.atualizarCronograma(id, dados);
  return res.data;
}

export async function excluirCronograma(id, serie = false) {
  const res = await estudoService.excluirCronograma(id, serie);
  return res.data;
}

// Sessões
export async function listarSessoes() {
  const res = await estudoService.listarSessoes();
  return res.data;
}

export async function iniciarSessao(dados) {
  const erros = validarSessao(dados);
  if (erros.length) throw new Error(erros.join(", "));
  const res = await estudoService.iniciarSessao(dados);
  return res.data;
}

export async function finalizarSessao(id, duracao_minutos, anotacao) {
  if (!duracao_minutos || duracao_minutos < 1)
      duracao_minutos = 1;
  const res = await estudoService.finalizarSessao(id, duracao_minutos, anotacao);
  return res.data;
}

export async function registrarTempoManual(dados) {
  const erros = validarSessao(dados);
  if (erros.length) throw new Error(erros.join(", "));
  if (!dados.duracao_minutos || dados.duracao_minutos <= 0)
    throw new Error("Duração é obrigatória");
  const res = await estudoService.registrarTempoManual(dados);
  return res.data;
}

// Temporizador (o servidor guarda o tempo e o estado)
export async function sessaoAtiva() {
  const res = await estudoService.sessaoAtiva();
  return res.data || null;
}
export async function pausarSessao(id) {
  return (await estudoService.pausarSessao(id)).data;
}
export async function retomarSessao(id) {
  return (await estudoService.retomarSessao(id)).data;
}
export async function pingSessao(id) {
  return (await estudoService.pingSessao(id)).data;
}
export async function registrarBloco(id) {
  return (await estudoService.registrarBloco(id)).data;
}
export async function encerrarSessao(id, anotacao) {
  return (await estudoService.encerrarSessao(id, anotacao)).data;
}
