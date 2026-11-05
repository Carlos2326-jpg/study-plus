export const gerarId = () => Date.now();

export const agruparPorDisciplina = (lista) => {
  return lista.reduce((acc, item) => {
    const chave = item.disciplina_id || "sem_disciplina";
    if (!acc[chave]) acc[chave] = [];
    acc[chave].push(item);
    return acc;
  }, {});
};

export const ordenarPorPrioridade = (tarefas) => {
  const ordem = { alta: 0, media: 1, baixa: 2 };
  return [...tarefas].sort(
    (a, b) => (ordem[a.prioridade] ?? 3) - (ordem[b.prioridade] ?? 3)
  );
};

export const ordenarPorPrazo = (tarefas) => {
  return [...tarefas].sort(
    (a, b) => new Date(a.prazo) - new Date(b.prazo)
  );
};