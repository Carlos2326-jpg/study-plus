import React, { useState, useEffect } from "react";
import "../../Assets/Styles/Pages/ProgressoPage.css";
import { relatorioService } from "../../Services/relatorioService";
import { disciplinaService } from "../../Services/disciplinaService";
import { tarefaService } from "../../Services/tarefaService";

export default function Progresso() {
  const [abaAtiva, setAbaAtiva] = useState("semana");
  const [dataReferencia, setDataReferencia] = useState(new Date());
  const [carregando, setCarregando] = useState(true);
  const [produtividade, setProdutividade] = useState(null);
  const [graficos, setGraficos] = useState(null);
  const [erro, setErro] = useState("");
  const [gerandoPdf, setGerandoPdf] = useState(false);
  
  const [disciplinas, setDisciplinas] = useState([]);
  const [tarefasReais, setTarefasReais] = useState([]);
  const [filtroDisciplina, setFiltroDisciplina] = useState("");

  // --- Lógica de Datas ---
  const getInicioFimSemana = (data) => {
    const d = new Date(data);
    const diaSemana = d.getDay();
    const inicio = new Date(d);
    inicio.setDate(d.getDate() - diaSemana);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + 6);
    fim.setHours(23, 59, 59, 999);
    return { inicio, fim };
  };

  const formatarDataQuery = (data) => {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
  };

  const formatarDataExibicao = (inicio, fim) => {
    const diaIni = String(inicio.getDate()).padStart(2, "0");
    const diaFim = String(fim.getDate()).padStart(2, "0");
    const mes = fim.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    const ano = fim.getFullYear();
    return `${diaIni} – ${diaFim} ${mes}. ${ano}`;
  };

  const navegar = (direcao) => {
    const novaData = new Date(dataReferencia);
    if (abaAtiva === "semana") {
      novaData.setDate(novaData.getDate() + (direcao === "proximo" ? 7 : -7));
    } else if (abaAtiva === "mes") {
      novaData.setMonth(novaData.getMonth() + (direcao === "proximo" ? 1 : -1));
    } else if (abaAtiva === "ano") {
      novaData.setFullYear(novaData.getFullYear() + (direcao === "proximo" ? 1 : -1));
    }
    setDataReferencia(novaData);
  };

  useEffect(() => {
    // Busca dados fixos (disciplinas e tarefas reais)
    const carregarDadosFixos = async () => {
      try {
        const [discData, tarefasData] = await Promise.all([
          disciplinaService.listar(),
          tarefaService.listar()
        ]);
        setDisciplinas(discData);
        setTarefasReais(tarefasData);
      } catch (error) {
        console.error("Erro ao carregar dados fixos:", error);
      }
    };
    carregarDadosFixos();
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      setCarregando(true);
      setErro("");
      try {
        let filtros = {};
        if (abaAtiva === "semana") {
          const { inicio, fim } = getInicioFimSemana(dataReferencia);
          filtros = { data_inicio: formatarDataQuery(inicio), data_fim: formatarDataQuery(fim) };
        } else if (abaAtiva === "mes") {
          const inicioMes = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth(), 1);
          const fimMes = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth() + 1, 0);
          filtros = { data_inicio: formatarDataQuery(inicioMes), data_fim: formatarDataQuery(fimMes) };
        } else if (abaAtiva === "ano") {
          const inicioAno = new Date(dataReferencia.getFullYear(), 0, 1);
          const fimAno = new Date(dataReferencia.getFullYear(), 11, 31);
          filtros = { data_inicio: formatarDataQuery(inicioAno), data_fim: formatarDataQuery(fimAno) };
        }

        if (filtroDisciplina) {
          filtros.disciplina = filtroDisciplina;
        }

        const [resProd, resGraf] = await Promise.all([
          relatorioService.buscarProdutividade(filtros),
          relatorioService.buscarDadosGraficos(filtros)
        ]);

        setProdutividade(resProd.data);
        setGraficos(resGraf.data);
      } catch (error) {
        console.error("Erro ao carregar progresso:", error);
        setErro("Não foi possível carregar os dados.");
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, [abaAtiva, dataReferencia, filtroDisciplina]);

  const baixarPdf = async () => {
    setGerandoPdf(true);
    try {
      const [{ pdf }, { default: RelatorioPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("../../Components/Relatorio/RelatorioPDF")
      ]);

      const dadosPdf = {
        produtividade: produtividade || {},
        graficos: graficos || {},
        periodoTexto: "Período selecionado",
        disciplinaTexto: filtroDisciplina || "Todas"
      };

      const blob = await pdf(<RelatorioPDF {...dadosPdf} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dataFormatada = new Date().toISOString().slice(0, 10);
      link.download = `relatorio-StudyPlus-${dataFormatada}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Não foi possível gerar o relatório.");
    } finally {
      setGerandoPdf(false);
    }
  };

  if (carregando) return <div className="loading-screen">Carregando seu progresso...</div>;
  if (erro) return <div className="loading-screen" style={{ color: "red" }}>{erro}</div>;

  // Contagem de tarefas real baseada no filtro
  const disciplinaSelecionadaObj = disciplinas.find(d => d.nome === filtroDisciplina);
  const tarefasFiltradas = filtroDisciplina && disciplinaSelecionadaObj
    ? tarefasReais.filter(t => t.disciplina_id === disciplinaSelecionadaObj.id)
    : tarefasReais;

  const totalTarefasReais = tarefasFiltradas.length;
  const tarefasConcluidasReais = tarefasFiltradas.filter(t => t.status === "concluida").length;
  
  const displayTotalTarefas = filtroDisciplina ? totalTarefasReais : (produtividade?.totalTarefas || 0);
  const displayTarefasConcluidas = filtroDisciplina ? tarefasConcluidasReais : (produtividade?.tarefasConcluidas || 0);

  const temHoras = produtividade?.totalHoras > 0;
  const semDadosTotais = !temHoras && displayTarefasConcluidas === 0;

  const { inicio, fim } = getInicioFimSemana(dataReferencia);

  // Prepara os dados do gráfico
  let ritmoAgrupado = [];
  if (graficos?.evolucao) {
    const evolucao = graficos.evolucao;
    if (abaAtiva === "semana") {
      const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      ritmoAgrupado = diasDaSemana.map(dia => ({ label: dia, valor: 0 }));
      evolucao.forEach(item => {
        const data = new Date(item.data + "T00:00:00");
        ritmoAgrupado[data.getDay()].valor += item.horas;
      });
    } else if (abaAtiva === "mes") {
      const semanas = [0, 0, 0, 0];
      evolucao.forEach(item => {
        const data = new Date(item.data + "T00:00:00");
        const indiceSemana = Math.floor((data.getDate() - 1) / 7);
        if (indiceSemana >= 0 && indiceSemana < 4) semanas[indiceSemana] += item.horas;
      });
      ritmoAgrupado = semanas.map((totalHoras, index) => ({
        label: `Sem ${index + 1}`,
        valor: Number(totalHoras.toFixed(2))
      }));
    } else {
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const totalPorMes = Array(12).fill(0);
      evolucao.forEach(item => {
        const data = new Date(item.data + "T00:00:00");
        totalPorMes[data.getMonth()] += item.horas;
      });
      ritmoAgrupado = meses.map((nomeMes, index) => ({
        label: nomeMes,
        valor: Number(totalPorMes[index].toFixed(2))
      }));
    }
  }

  const maiorValorRitmo = Math.max(...ritmoAgrupado.map(r => r.valor), 0.01);

  // --- FILTRO DE DISCIPLINAS FANTASMAS ---
  // Pega as barras enviadas pelo Back-end e remove as que não existem mais no banco
  const nomesDisciplinasReais = disciplinas.map(d => d.nome);
  
  let tempoPorDisciplina = graficos?.barras
    ?.filter(item => nomesDisciplinasReais.includes(item.disciplina)) // Remove fantasmas
    ?.map((item, index) => ({
      nome: item.disciplina,
      horas: item.horas,
      percentual: produtividade?.totalHoras > 0 ? Math.round((item.horas / produtividade.totalHoras) * 100) : 0,
      cor: index === 0 ? "var(--purple-dark)" : index === 1 ? "var(--purple-main)" : "var(--purple-light)"
    })) || [];

  if (filtroDisciplina) {
    tempoPorDisciplina = tempoPorDisciplina.filter(d => d.nome === filtroDisciplina);
  }

  const maiorTempo = tempoPorDisciplina.length > 0 ? tempoPorDisciplina[0] : null;

  return (
    <div className="progresso-container">
      <div className="progresso-header-top">
        <div className="progresso-title-group">
          <div className="logo-icon-small">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--branco)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <h1>Produtividade</h1>
        </div>
      </div>

      <div className="progresso-tabs">
        <button className={abaAtiva === "semana" ? "active" : ""} onClick={() => setAbaAtiva("semana")}>Semana</button>
        <button className={abaAtiva === "mes" ? "active" : ""} onClick={() => setAbaAtiva("mes")}>Mês</button>
        <button className={abaAtiva === "ano" ? "active" : ""} onClick={() => setAbaAtiva("ano")}>Ano</button>
      </div>

      <div className="progresso-controles">
        <div className="controle-data">
          <button className="btn-seta" onClick={() => navegar("anterior")}>‹</button>
          <span>
            📅 {abaAtiva === "semana" 
              ? formatarDataExibicao(inicio, fim) 
              : abaAtiva === "mes" 
                ? dataReferencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                : dataReferencia.getFullYear()
            }
          </span>
          <button className="btn-seta" onClick={() => navegar("proximo")}>›</button>
        </div>
        <div className="controle-filtros">
          <select 
            className="btn-filtro-disciplina" 
            value={filtroDisciplina}
            onChange={(e) => setFiltroDisciplina(e.target.value)}
            style={{ 
              background: "transparent", 
              border: "1px solid var(--cinza-200)", 
              borderRadius: "8px", 
              padding: "0.35rem 0.75rem",
              cursor: "pointer",
              fontSize: "0.85rem",
              color: "var(--texto-secundario)"
            }}
          >
            <option value="">Todas as disciplinas</option>
            {disciplinas.map(d => (
              <option key={d.id} value={d.nome}>{d.nome}</option>
            ))}
          </select>
          <span className="txt-registros">Todos os registros</span>
        </div>
      </div>

      {semDadosTotais ? (
        <div className="card-empty-state">
          <h2>Nenhuma atividade registrada</h2>
          <p className="empty-descricao">Não há registros para este período ou disciplina.</p>
        </div>
      ) : (
        <>
          <div className="progresso-resumo-grid">
            <div className="card-resumo-destaque">
              <span className="lbl">Horas estudadas</span>
              <div className="valor-linha">
                <span className="val-grande">{produtividade?.totalHoras || 0} h</span>
                <span className="val-pequeno">no período</span>
              </div>
            </div>
            <div className="card-resumo-branco">
              <span className="lbl">Tarefas concluídas</span>
              <div className="valor-linha">
                <span className="val-grande">{displayTarefasConcluidas}</span>
                <span className="val-pequeno">de {displayTotalTarefas}</span>
              </div>
            </div>
          </div>

          <div className="progresso-graficos-grid">
            <div className="card-grafico">
              <div className="card-header-flex">
                <h3>Seu ritmo de estudo {filtroDisciplina && `- ${filtroDisciplina}`}</h3>
                <span className="legenda">
                  {abaAtiva === "semana" ? "Horas por dia" : abaAtiva === "mes" ? "Horas por semana" : "Horas por mês"}
                </span>
              </div>
              
              {!temHoras ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "160px", color: "var(--texto-secundario)", fontSize: "0.85rem", textAlign: "center" }}>
                  <span style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏱️</span>
                  <p>Você ainda não registrou horas de estudo no Timer para esta disciplina.</p>
                </div>
              ) : (
                <div className="bar-chart-container">
                  {ritmoAgrupado.map((item, index) => {
                    const altura = (item.valor / maiorValorRitmo) * 100;
                    const isDestaque = item.valor === maiorValorRitmo && item.valor > 0;

                    return (
                      <div key={index} className="bar-column" style={{ flex: 1, minWidth: "20px" }}>
                        <span className="bar-value">{item.valor > 0 ? item.valor : ""}</span>
                        <div className="bar-wrapper">
                          <div 
                            className="bar-fill" 
                            style={{ 
                              height: `${Math.max(altura, 2)}%`,
                              background: isDestaque ? "var(--purple-dark)" : "var(--purple-light)" 
                            }}
                          ></div>
                        </div>
                        <span className="bar-label" style={{ fontSize: "0.7rem" }}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card-disciplinas">
              <h3>Tempo por disciplina</h3>
              {tempoPorDisciplina.length === 0 || !temHoras ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "160px", color: "var(--texto-secundario)", fontSize: "0.85rem", textAlign: "center" }}>
                  <span style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📚</span>
                  <p>Nenhuma hora registrada ainda.</p>
                </div>
              ) : (
                <>
                  <div className="lista-disciplinas">
                    {tempoPorDisciplina.map((disc, index) => (
                      <div key={index} className="disciplina-row">
                        <span className="disc-nome">{disc.nome}</span>
                        <div className="disc-bar-bg">
                          <div className="disc-bar-fill" style={{ width: `${disc.percentual}%`, background: disc.cor }}></div>
                        </div>
                        <span className="disc-tempo">{disc.horas} h · {disc.percentual}%</span>
                      </div>
                    ))}
                  </div>
                  {maiorTempo && (
                    <div className="alerta-maior-tempo">
                      <span className="icone-trofeu">🏆</span>
                      <span>Maior tempo: {maiorTempo.nome} · {maiorTempo.horas} h</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      <button 
        className="btn-relatorio-detalhado" 
        onClick={baixarPdf} 
        disabled={gerandoPdf || semDadosTotais}
        style={{ opacity: (gerandoPdf || semDadosTotais) ? 0.5 : 1, cursor: (gerandoPdf || semDadosTotais) ? "not-allowed" : "pointer" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        {gerandoPdf ? "Gerando PDF..." : "Ver relatório detalhado"} <span>→</span>
      </button>
    </div>
  );
}