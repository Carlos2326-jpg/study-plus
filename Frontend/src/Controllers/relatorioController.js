// ============================================================
// CONTROLLER - Área 3: Relatórios
// Study+
// ============================================================

import { relatorioService } from "../Services/relatorioService";

export async function buscarProdutividade(filtros = {}) {
  const res = await relatorioService.buscarProdutividade(filtros);
  return res.data;
}

export async function buscarDadosGraficos(filtros = {}) {
  const res = await relatorioService.buscarDadosGraficos(filtros);
  return res.data;
}
