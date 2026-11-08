import { useState } from "react";
import { gerarDatasRecorrentes } from "../../Controllers/tarefaController.js";
import "../../Assets/Styles/Components/Calendario.css";

const diasSemana = ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];
const mesesNome = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const coresDisciplina = ["#2d6a4f","#52b788","#1a472a","#74c69d","#40916c","#95d5b2"];

const Calendario = ({ tarefas = [], cronogramas = [], disciplinas = [] }) => {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  const irMesAnterior = () => { if (mes === 0) { setMes(11); setAno(ano - 1); } else setMes(mes - 1); };
  const irProximoMes  = () => { if (mes === 11) { setMes(0); setAno(ano + 1); } else setMes(mes + 1); };

  const gerarDiasMes = () => {
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const diasMesAnterior = new Date(ano, mes, 0).getDate();
    const dias = [];
    for (let i = primeiroDia - 1; i >= 0; i--) dias.push({ dia: diasMesAnterior - i, mesAtual: false });
    for (let i = 1; i <= totalDias; i++) dias.push({ dia: i, mesAtual: true });
    const restante = 42 - dias.length;
    for (let i = 1; i <= restante; i++) dias.push({ dia: i, mesAtual: false });
    return dias;
  };

  const getTarefasDoDia = (dia, mesAtual) => {
    if (!mesAtual) return [];
    const dataStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const tarefasPrazo = tarefas.filter((t) => (t.prazo ? t.prazo.split("T")[0] : "") === dataStr);
    const tarefasRecorrentes = cronogramas
      .filter((c) => gerarDatasRecorrentes({ ...c, data: c.data ? c.data.split("T")[0] : c.data }).includes(dataStr))
      .map((c) => { const t = tarefas.find((t) => t.id === Number(c.tarefa_id)); return t ? { ...t, disciplina_id: c.disciplina_id || t.disciplina_id } : null; })
      .filter(Boolean);
    const ids = new Set(tarefasPrazo.map((t) => t.id));
    const todas = [...tarefasPrazo];
    tarefasRecorrentes.forEach((t) => { if (!ids.has(t.id)) todas.push(t); });
    return todas;
  };

  const getCorDisciplina = (disciplina_id) => coresDisciplina[(disciplina_id || 0) % coresDisciplina.length];

  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  const dias = gerarDiasMes();
  const tarefasDiaSelecionado = diaSelecionado ? getTarefasDoDia(diaSelecionado, true) : [];

  return (
    <div className="cal-comp-container">

      <div className="cal-comp-header">
        <button className="cal-comp-btn-nav" onClick={irMesAnterior}>‹</button>
        <span className="cal-comp-titulo-mes">{mesesNome[mes]} / {ano}</span>
        <button className="cal-comp-btn-nav" onClick={irProximoMes}>›</button>
      </div>

      <div className="cal-comp-grid">
        {diasSemana.map((d) => (
          <div key={d} className="cal-comp-header-dia">{d}</div>
        ))}
        {dias.map((item, index) => {
          const dataStr = item.mesAtual ? `${ano}-${String(mes + 1).padStart(2, "0")}-${String(item.dia).padStart(2, "0")}` : null;
          const isHoje = dataStr === hojeStr;
          const isSelecionado = item.mesAtual && item.dia === diaSelecionado;
          const tarefasDia = getTarefasDoDia(item.dia, item.mesAtual);

          return (
            <div
              key={index}
              className={`cal-comp-celula${isHoje ? " cal-comp-celula--hoje" : ""}${isSelecionado ? " cal-comp-celula--selecionado" : ""}${!item.mesAtual ? " cal-comp-celula--fora" : ""}`}
              onClick={() => item.mesAtual && setDiaSelecionado(item.dia)}
            >
              <span className="cal-comp-num-dia">{String(item.dia).padStart(2, "0")}</span>
              {tarefasDia.length > 0 && (
                <div className="cal-comp-pontinhos">
                  {tarefasDia.slice(0, 3).map((t, i) => (
                    <span key={i} className="cal-comp-ponto" style={{ backgroundColor: getCorDisciplina(t.disciplina_id) }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {diaSelecionado && (
        <div className="cal-comp-painel">
          <p className="cal-comp-painel-titulo">
            {String(diaSelecionado).padStart(2, "0")}/{String(mes + 1).padStart(2, "0")}/{ano}
          </p>
          {tarefasDiaSelecionado.length === 0 ? (
            <p className="cal-comp-vazio">Nenhuma tarefa neste dia.</p>
          ) : (
            tarefasDiaSelecionado.map((t) => {
              const disciplina = disciplinas.find((d) => d.id === Number(t.disciplina_id));
              return (
                <div key={t.id} className="cal-comp-tarefa-item">
                  <div className="cal-comp-tarefa-infos">
                    <span className="cal-comp-ponto-disc" style={{ backgroundColor: getCorDisciplina(t.disciplina_id) }} />
                    <span className="cal-comp-tarefa-titulo">{t.titulo}</span>
                  </div>
                  {disciplina && <span className="cal-comp-tarefa-disc">{disciplina.nome}</span>}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Calendario;