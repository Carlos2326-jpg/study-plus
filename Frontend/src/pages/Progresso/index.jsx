// ============================================================
// PAGE - Área 3: Progresso
// Study+
// ============================================================

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  buscarDadosGraficos,
  buscarProdutividade,
} from "../../Controllers/relatorioController";
import "./Progresso.css";

const CORES = ["#6366f1", "#f59e0b", "#22c55e", "#ef4444", "#06b6d4"];

export default function Progresso() {
  const [graficos, setGraficos] = useState(null);
  const [produtividade, setProdutividade] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const [g, p] = await Promise.all([
        buscarDadosGraficos(),
        buscarProdutividade(),
      ]);
      setGraficos(g);
      setProdutividade(p);
      setCarregando(false);
    }
    carregar();
  }, []);

  if (carregando)
    return <div className="progresso-loading">Carregando dados...</div>;

  const semDados = !graficos?.barras?.length;

  return (
    <div className="progresso-page">
      <h1 className="progresso-titulo">Progresso</h1>

      {semDados ? (
        <div className="progresso-vazio">
          <p>Nenhuma sessão de estudo registrada ainda.</p>
          <p>Use o Temporizador para registrar seu tempo de estudo!</p>
        </div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="resumo-cards">
            <div className="resumo-card">
              <span className="resumo-valor">
                {produtividade?.totalHoras ?? 0}h
              </span>
              <span className="resumo-label">Total estudado</span>
            </div>
            <div className="resumo-card">
              <span className="resumo-valor">
                {produtividade?.totalSessoes ?? 0}
              </span>
              <span className="resumo-label">Sessões realizadas</span>
            </div>
            <div className="resumo-card">
              <span className="resumo-valor">
                {graficos?.progresso?.length ?? 0}
              </span>
              <span className="resumo-label">Metas ativas</span>
            </div>
          </div>

          {/* Gráfico de barras */}
          <div className="grafico-container">
            <h2>Horas por disciplina</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={graficos.barras}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
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
                <Pie
                  data={graficos.pizza}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                >
                  {graficos.pizza.map((_, i) => (
                    <Cell key={i} fill={CORES[i % CORES.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v) => [`${v}h`, "Horas"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Termômetro de metas */}
          <div className="grafico-container">
            <h2>Metas — progresso atual</h2>
            <div className="termometro-lista">
              {graficos.progresso.map((item, i) => (
                <div key={i} className="termometro-item">
                  <div className="termometro-header">
                    <span className="termometro-disciplina">
                      {item.disciplina}
                    </span>
                    <span className="termometro-percentual">
                      {item.percentual}%
                    </span>
                  </div>
                  <div className="termometro-bar">
                    <div
                      className="termometro-fill"
                      style={{
                        width: `${item.percentual}%`,
                        background:
                          item.percentual >= 100
                            ? "#22c55e"
                            : item.percentual >= 50
                              ? "#f59e0b"
                              : "#6366f1",
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
        </>
      )}
    </div>
  );
}