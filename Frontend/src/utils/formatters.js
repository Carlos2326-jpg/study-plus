export function formatarData(dataISO) {
  if (!dataISO) return "";
  return new Date(dataISO).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatarDataHora(dataISO) {
  if (!dataISO) return "";
  return new Date(dataISO).toLocaleString("pt-BR");
}

export function formatarHorario(horario) {
  if (!horario) return "";
  return horario.slice(0, 5);
}

export function formatarDuracao(minutos) {
  if (minutos == null) return "0 min";
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}