import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import {
  buscarDadosGraficos,
  buscarProdutividade,
} from "../../Controllers/relatorioController";
import { disciplinaService } from "../../Services/disciplinaService";
import "../../Assets/Styles/Pages/Progresso.css";

const CORES = ["#6366f1", "#f59e0b", "#22c55e", "#ef4444", "#06b6d4"];

const PERIODOS = [
  { valor: "", label: "Tudo" },
  { valor: "semana", label: "Últimos 7 dias" },
  { valor: "mes", label: "Últimos 30 dias" },
  { valor: "ano", label: "Último ano" },
  { valor: "personalizado", label: "Personalizado" },
];

const ESTADO_LABEL = {
  pendente: "Pendentes",
  em_andamento: "Em andamento",
  concluida: "Concluídas",
  bloqueada: "Bloqueadas",
};

const diaMes = (d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

function montarFiltros(periodo, ini, fim, disciplina) {
  const f = {};
  if (periodo === "personalizado") {
    if (ini) f.data_inicio = ini;
    if (fim) f.data_fim = fim;
  } else if (periodo) {
    f.periodo = periodo;
  }
  if (disciplina) f.disciplina = disciplina;
  return f;
}

export default function Progresso() {
  const [periodo, setPeriodo] = useState("");
  const [ini, setIni] = useState("");
  const [fim, setFim] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);
  const [graficos, setGraficos] = useState(null);
  const [produtividade, setProdutividade] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [gerandoPdf, setGerandoPdf] = useState(false);

  async function baixarPdf() {
    setGerandoPdf(true);
    setErro("");
    try {
      // Carrega a biblioteca só quando o botão é usado (não pesa o resto do site)
      const [{ pdf }, { default: RelatorioPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("../../Components/Relatorio/RelatorioPDF"),
      ]);

      const diaBR = (d) => d.split("-").reverse().join("/");
      const periodoTexto =
        periodo === "personalizado"
          ? `${ini ? diaBR(ini) : "início"} a ${fim ? diaBR(fim) : "hoje"}`
          : PERIODOS.find((p) => p.valor === periodo)?.label || "Tudo";

      const blob = await pdf(
        <RelatorioPDF
          produtividade={produtividade}
          graficos={graficos}
          periodoTexto={periodoTexto}
          disciplinaTexto={disciplina || "Todas"}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-studyplus-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      setErro("Não foi possível gerar o PDF.");
    } finally {
      setGerandoPdf(false);
    }
  }

  useEffect(() => {
    disciplinaService.listar().then(setDisciplinas).catch(() => {});
  }, []);

  useEffect(() => {
    if (periodo === "personalizado" && ini && fim && ini > fim) {
      setErro("A data inicial não pode ser posterior à data final.");
      return;
    }
    let ativo = true;
    setCarregando(true);
    setErro("");
    const filtros = montarFiltros(periodo, ini, fim, disciplina);
    Promise.all([buscarDadosGraficos(filtros), buscarProdutividade(filtros)])
      .then(([g, p]) => {
        if (!ativo) return;
        setGraficos(g);
        setProdutividade(p);
      })
      .catch((e) => {
        if (ativo) setErro(e?.response?.data?.message || "Erro ao carregar os dados.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [periodo, ini, fim, disciplina]);

  const semDados = produtividade?.semDados;
  const totalTarefas = produtividade?.totalTarefas ?? 0;

  return (
    <div className="progresso-page">
      <h1 className="progresso-titulo">Progresso</h1>

      {/* Filtros */}
      <div className="progresso-filtros">
        <label>
          Período
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            {PERIODOS.map((p) => (
              <option key={p.valor} value={p.valor}>{p.label}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn-pdf"
          onClick={baixarPdf}
          disabled={gerandoPdf || carregando || !produtividade || !graficos}
        >
          {gerandoPdf ? "Gerando PDF..." : "Baixar PDF"}
        </button>
        {periodo === "personalizado" && (
          <>
            <label>
              De
              <input type="date" value={ini} onChange={(e) => setIni(e.target.value)} />
            </label>
            <label>
              Até
              <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
            </label>
          </>
        )}

        <label>
          Disciplina
          <select value={disciplina} onChange={(e) => setDisciplina(e.target.value)}>
            <option value="">Todas</option>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.nome}>{d.nome}</option>
            ))}
          </select>
        </label>
      </div>

      {erro && <p className="mensagem-erro">{erro}</p>}
      {carregando && <div className="progresso-loading">Carregando dados...</div>}

      {!carregando && !erro && produtividade && graficos && (
        <>
          {semDados ? (
            <div className="progresso-vazio">
              <p>{produtividade.mensagem || "Não há dados de estudo para o período selecionado."}</p>
              <p>Use o Temporizador para registrar seu tempo de estudo!</p>
            </div>
          ) : (
            <>
              {/* Cards de resumo */}
              <div className="resumo-cards">
                <div className="resumo-card">
                  <span className="resumo-valor">{produtividade.totalHoras}h</span>
                  <span className="resumo-label">Total estudado</span>
                </div>
                <div className="resumo-card">
                  <span className="resumo-valor">{produtividade.totalSessoes}</span>
                  <span className="resumo-label">Sessões realizadas</span>
                </div>
                <div className="resumo-card">
                  <span className="resumo-valor">
                    {produtividade.disciplinaMaisEstudada || "—"}
                  </span>
                  <span className="resumo-label">Disciplina mais estudada</span>
                </div>
                <div className="resumo-card">
                  <span className="resumo-valor">
                    {produtividade.tarefasConcluidas}/{totalTarefas}
                  </span>
                  <span className="resumo-label">Tarefas concluídas</span>
                </div>
              </div>

              {/* Evolução diária */}
              {graficos.evolucao?.length > 0 && (
                <div className="grafico-container">
                  <h2>Evolução do tempo de estudo</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={graficos.evolucao} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="data" tickFormatter={diaMes} tick={{ fontSize: 12 }} minTickGap={20} />
                      <YAxis tick={{ fontSize: 13 }} unit="h" />
                      <Tooltip
                        labelFormatter={(d) => diaMes(d)}
                        formatter={(v) => [`${v}h`, "Horas"]}
                      />
                      <Line type="monotone" dataKey="horas" stroke="#6366f1" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Gráfico de barras */}
              <div className="grafico-container">
                <h2>Horas por disciplina</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={graficos.barras} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="disciplina" tick={{ fontSize: 13 }} />
                    <YAxis tick={{ fontSize: 13 }} unit="h" />
                    <Tooltip formatter={(v) => [`${v}h`, "Horas"]} />
                    <Bar dataKey="horas" radius={[6, 6, 0, 0]}>
                      {graficos.barras.map((_, i) => (
                        <Cell key={i} fill={CORES[i % CORES.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de pizza */}
              <div className="grafico-container">
                <h2>Distribuição do tempo</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={graficos.pizza} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                      {graficos.pizza.map((_, i) => (
                        <Cell key={i} fill={CORES[i % CORES.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v) => [`${v}h`, "Horas"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Sessões do período */}
              <div className="grafico-container">
                <h2>Sessões do período</h2>
                <table className="sessoes-tabela">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Disciplina</th>
                      <th>Técnica</th>
                      <th>Duração</th>
                      <th>Pausas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtividade.sessoes.slice(0, 10).map((s) => (
                      <tr key={s.id}>
                        <td>{s.inicio ? new Date(s.inicio).toLocaleString("pt-BR") : "—"}</td>
                        <td>{s.disciplina}</td>
                        <td>{s.tecnica_usada || "—"}</td>
                        <td>{s.duracao_minutos ?? 0} min</td>
                        <td>{s.pausas ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {produtividade.sessoes.length > 10 && (
                  <p className="sessoes-mais">
                    Mostrando as 10 mais recentes de {produtividade.sessoes.length}.
                  </p>
                )}
              </div>
            </>
          )}

          {/* Tarefas por estado (não depende do período) */}
          {graficos.tarefasPorEstado?.length > 0 && (
            <div className="grafico-container">
              <h2>Tarefas por estado</h2>
              <div className="estados-lista">
                {graficos.tarefasPorEstado.map((t) => (
                  <div key={t.estado} className="estado-chip">
                    <strong>{t.total}</strong> {ESTADO_LABEL[t.estado] || t.estado}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Termômetro de metas */}
          {graficos.progresso?.length > 0 && (
            <div className="grafico-container">
              <h2>Metas — progresso atual</h2>
              <div className="termometro-lista">
                {graficos.progresso.map((item, i) => (
                  <div key={i} className="termometro-item">
                    <div className="termometro-header">
                      <span className="termometro-disciplina">{item.disciplina}</span>
                      <span className="termometro-percentual">{item.percentual}%</span>
                    </div>
                    <div className="termometro-bar">
                      <div
                        className="termometro-fill"
                        style={{
                          width: `${Math.min(100, item.percentual)}%`,
                          background:
                            item.percentual >= 100 ? "#22c55e" : item.percentual >= 50 ? "#f59e0b" : "#6366f1",
                        }}
                      />
                    </div>
                    <div className="termometro-detalhe">
                      {item.cumprido}h cumpridas de {item.alvo}h
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}