
export const validarCamposObrigatorios = (dados, campos) => {
  const erros = [];
  campos.forEach((campo) => {
    if (!dados[campo] || String(dados[campo]).trim() === "") {
      erros.push(`Campo "${campo}" é obrigatório.`);
    }
  });
  return erros;
};


export const validarDataFutura = (data) => {
  if (!data) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataVerificada = new Date(data);
  return dataVerificada >= hoje;
};


export const validarIntervaloData = (dataInicio, dataFim) => {
  if (!dataInicio || !dataFim) return true;
  return new Date(dataInicio) <= new Date(dataFim);
};


export const validarTitulo = (titulo) => {
  if (!titulo || titulo.trim() === "") return "Título é obrigatório.";
  if (titulo.trim().length < 3) return "Título deve ter pelo menos 3 caracteres.";
  if (titulo.trim().length > 100) return "Título deve ter no máximo 100 caracteres.";
  return null;
};

export const validarSubtarefa = (titulo) => {
  if (!titulo || titulo.trim() === "") return "Título da subtarefa é obrigatório.";
  if (titulo.trim().length > 100) return "Subtarefa deve ter no máximo 100 caracteres.";
  return null;
};