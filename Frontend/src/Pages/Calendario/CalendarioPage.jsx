import React, { useState, useEffect } from "react";
import "../../Assets/Styles/Pages/CalendarioPage.css";
import { estudoService } from "../../Services/estudoService";
import { tarefaService } from "../../Services/tarefaService";
import { formatarData, formatarHorario } from "../../Utils/formatters";

export default function CalendarioPage() {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [cronogramas, setCronogramas] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [diaSelecionado, setDiaSelecionado] = useState(new Date().getDate());

  // 1. Buscar os Cronogramas e Tarefas no Back-end
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resCronogramas, resTarefas] = await Promise.all([
          estudoService.listarCronogramas(),
          tarefaService.listar()
        ]);

        // O axios retorna { data: [...] } às vezes, então tratamos isso
        const listaCronogramas = resCronogramas.data || resCronogramas;
        const listaTarefas = resTarefas.data || resTarefas;

        setCronogramas(listaCronogramas);
        setTarefas(listaTarefas);
      } catch (error) {
        console.error("Erro ao carregar dados do calendário:", error);
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, []);

  // 2. Lógica do Calendário
  const diasSemana = ["D", "S", "T", "Q", "Q", "S", "S"];
  const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();
  const primeiroDiaSemana = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).getDay();

  const diasVazios = Array.from({ length: primeiroDiaSemana }, (_, i) => i);
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);

  const nomeMes = mesAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const mesFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

  // Função para verificar se tem algum evento (Estudo ou Tarefa) num dia
  const temEventoNoDia = (dia) => {
    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    
    // Verifica se tem cronograma
    const temEstudo = cronogramas.some(c => c.data && c.data.split("T")[0] === dataStr);
    // Verifica se tem tarefa (prazo)
    const temTarefa = tarefas.some(t => t.prazo && t.prazo.split("T")[0] === dataStr);

    return temEstudo || temTarefa;
  };

  // Filtra os eventos do dia selecionado
  const dataStrSelecionada = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, "0")}-${String(diaSelecionado).padStart(2, "0")}`;
  
  // Estudos do dia
  const estudosDoDia = cronogramas.filter(c => c.data && c.data.split("T")[0] === dataStrSelecionada);
  
  // Tarefas do dia
  const tarefasDoDia = tarefas.filter(t => t.prazo && t.prazo.split("T")[0] === dataStrSelecionada);

  if (carregando) return <div className="loading-screen">Carregando calendário...</div>;

  return (
    <div className="calendario-page">
      {/* Header */}
      <div className="cal-header">
        <h1>{mesFormatado}</h1>
        <div className="cal-header-actions">
          <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))}>‹</button>
          <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))}>›</button>
        </div>
      </div>

      <div className="cal-layout-grid">
        {/* Card do Calendário */}
        <div className="cal-grid-card">
          <div className="cal-weekdays">
            {diasSemana.map((d, i) => <span key={i}>{d}</span>)}
          </div>

          <div className="cal-days-grid">
            {diasVazios.map((v) => <div key={`v-${v}`} className="cal-day empty"></div>)}
            {dias.map((dia) => {
              const isHoje = dia === new Date().getDate() && mesAtual.getMonth() === new Date().getMonth() && mesAtual.getFullYear() === new Date().getFullYear();
              const temEvento = temEventoNoDia(dia);
              const isSelecionado = dia === diaSelecionado;

              return (
                <div 
                  key={dia} 
                  className={`cal-day ${isHoje ? "hoje" : ""} ${isSelecionado ? "selecionado" : ""}`}
                  onClick={() => setDiaSelecionado(dia)}
                  style={isSelecionado && !isHoje ? { background: "var(--purple-suave)", fontWeight: "bold" } : {}}
                >
                  <span className="num">{dia}</span>
                  {temEvento && <div className="dot"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Eventos do Dia */}
        <div className="cal-eventos-col">
          <h2 className="cal-eventos-title">
            {diaSelecionado} DE {mesFormatado.split(" ")[0].toUpperCase()}
          </h2>

          <div className="cal-eventos-lista">
            {estudosDoDia.length === 0 && tarefasDoDia.length === 0 ? (
              <p style={{ color: "var(--texto-secundario)", fontSize: "0.9rem" }}>
                Nenhum compromisso agendado para este dia.
              </p>
            ) : (
              <>
                {/* Renderiza os ESTUDOS (Roxo) */}
                {estudosDoDia.map((estudo) => (
                  <div key={`estudo-${estudo.id}`} className="cal-evento-card border-roxo">
                    <div className="evento-info">
                      <h3>{estudo.disciplina || "Estudo"}</h3>
                      <p>
                        {formatarHorario(estudo.hora_inicio)} - {formatarHorario(estudo.hora_fim)} 
                        {estudo.recorrencia !== "nenhuma" && ` • ${estudo.recorrencia}`}
                      </p>
                    </div>
                    <span className="badge alta">Estudo</span>
                  </div>
                ))}

                {/* Renderiza as TAREFAS (Laranja) */}
                {tarefasDoDia.map((tarefa) => (
                  <div key={`tarefa-${tarefa.id}`} className="cal-evento-card border-laranja">
                    <div className="evento-info">
                      <h3>{tarefa.titulo}</h3>
                      <p>Prazo: {formatarData(tarefa.prazo)} • {tarefa.prioridade}</p>
                    </div>
                    <span className="badge media">Tarefa</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}