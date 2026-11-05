export function formatarData(dataISO) {
  if (!dataISO) return "";
  return new Date(dataISO).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatarHorario(horario) {
  if (!horario) return "";
  return horario.slice(0, 5); // "07:00:00" → "07:00"
}