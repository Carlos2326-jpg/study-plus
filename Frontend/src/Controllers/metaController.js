// ============================================================
// CONTROLLER - Área 3: Metas
// Study+
// ============================================================

import { metaService } from "../Services/metaService";

function validarMeta(dados) {
  const erros = [];
  if (!dados.disciplina) erros.push("Disciplina é obrigatória");
  if (!dados.carga_horaria_alvo || dados.carga_horaria_alvo <= 0)
    erros.push("Carga horária deve ser maior que zero");
  if (!dados.data_inicio) erros.push("Data de início é obrigatória");
  if (!dados.data_fim) erros.push("Data de fim é obrigatória");
  if (dados.data_inicio && dados.data_fim && dados.data_inicio > dados.data_fim)
    erros.push("Data de início não pode ser maior que a data de fim");
  if (!dados.tipo) erros.push("Tipo da meta é obrigatório");
  return erros;
}

export async function listarMetas() {
  const res = await metaService.listar();
  return res.data;
}

export async function buscarMeta(id) {
  const res = await metaService.buscarPorId(id);
  return res.data;
}

export async function criarMeta(dados) {
  const erros = validarMeta(dados);
  if (erros.length) throw new Error(erros.join(", "));
  const res = await metaService.criar(dados);
  return res.data;
}

export async function atualizarMeta(id, dados) {
  const erros = validarMeta(dados);
  if (erros.length) throw new Error(erros.join(", "));
  const res = await metaService.atualizar(id, dados);
  return res.data;
}

export async function excluirMeta(id) {
  const res = await metaService.excluir(id);
  return res.data;
}

export async function buscarProgressoMeta(id) {
  const res = await metaService.buscarProgresso(id);
  return res.data;
}
