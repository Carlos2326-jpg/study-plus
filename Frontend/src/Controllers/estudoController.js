// ============================================================
// CONTROLLER - Área 3: Estudo (Cronogramas + Sessões)
// Study+
// ============================================================

import { estudoService } from "../Services/estudoService";

function validarCronograma(dados) {
  const erros = [];
  if (!dados.disciplina) erros.push("Disciplina é obrigatória");
  if (!dados.horario_inicio) erros.push("Horário de início é obrigatório");
  if (!dados.horario_fim) erros.push("Horário de fim é obrigatório");
  if (dados.horario_inicio && dados.horario_fim && dados.horario_inicio >= dados.horario_fim)
    erros.push("Horário de início deve ser anterior ao horário de fim");
  if (!dados.data_inicio) erros.push("Data de início é obrigatória");
  if (!dados.data_fim) erros.push("Data de fim é obrigatória");
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

export async function criarCronograma(dados) {
  const erros = validarCronograma(dados);
  if (erros.length) throw new Error(erros.join(", "));

  const conflito = await estudoService.validarConflito(dados);
  if (conflito.data.conflito)
    throw new Error("Conflito de horário com cronograma existente");

  const res = await estudoService.criarCronograma(dados);
  return res.data;
}

export async function atualizarCronograma(id, dados) {
  const erros = validarCronograma(dados);
  if (erros.length) throw new Error(erros.join(", "));
  const res = await estudoService.atualizarCronograma(id, dados);
  return res.data;
}

export async function excluirCronograma(id) {
  const res = await estudoService.excluirCronograma(id);
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
