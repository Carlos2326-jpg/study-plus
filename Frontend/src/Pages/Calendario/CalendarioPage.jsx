import React, { useState, useEffect } from "react";
import { formatarData } from "../../Utils/formatters";
import "../../Assets/Styles/Pages/CalendarioPage.css";

// Dados mockados apenas para visualização do protótipo
const eventosMock = [
  {
    id: 1,
    titulo: "Daily com equipe",
    hora: "09:00",
    disciplina: "Focusly",
    prioridade: "Alta",
    cor: "laranja",
  },
  {
    id: 2,
    titulo: "Revisão do código da landing",
    hora: "11:30",
    disciplina: "Desenvolvimento",
    prioridade: "Média",
    cor: "roxo",
  },
  {
    id: 3,
    titulo: "Atualizar roadmap técnico",
    hora: "15:00",
    disciplina: "Estratégia",
    prioridade: "Leve",
    cor: "vermelho",
  },
];

export default function CalendarioPage() {
  const [mesAtual, setMesAtual] = useState(new Date(2026, 9, 1)); // Outubro de 2026

  const diasSemana = ["D", "S", "T", "Q", "Q", "S", "S"];

  // Lógica simplificada de geração de dias para o protótipo visual
  const diasNoMes = new Date(
    mesAtual.getFullYear(),
    mesAtual.getMonth() + 1,
    0,
  ).getDate();
  const primeiroDiaSemana = new Date(
    mesAtual.getFullYear(),
    mesAtual.getMonth(),
    1,
  ).getDay();

  const diasVazios = Array.from({ length: primeiroDiaSemana }, (_, i) => i);
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);

  const nomeMes = mesAtual.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const mesFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

  return (
    <div className="calendario-page">
      <div className="cal-header">
        <h1>{mesFormatado}</h1>
        <div className="cal-header-actions">
          <button
            onClick={() =>
              setMesAtual(
                new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1),
              )
            }
          >
            ‹
          </button>
          <button
            onClick={() =>
              setMesAtual(
                new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1),
              )
            }
          >
            ›
          </button>
        </div>
      </div>

      <div className="cal-layout-grid">
        {/* Card do Calendário */}
        <div className="cal-grid-card">
          <div className="cal-weekdays">
            {diasSemana.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="cal-days-grid">
            {diasVazios.map((v) => (
              <div key={`v-${v}`} className="cal-day empty"></div>
            ))}
            {dias.map((dia) => {
              const isHoje = dia === 12; // Mock visual
              const temEvento = [8, 12, 14, 22, 28].includes(dia);

              return (
                <div key={dia} className={`cal-day ${isHoje ? "hoje" : ""}`}>
                  <span className="num">{dia}</span>
                  {temEvento && <div className="dot"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Eventos do Dia */}
        <div className="cal-eventos-col">
          <h2 className="cal-eventos-title">HOJE, 12 DE OUTUBRO</h2>

          <div className="cal-eventos-lista">
            {eventosMock.map((ev) => (
              <div key={ev.id} className={`cal-evento-card border-${ev.cor}`}>
                <div className="evento-info">
                  <h3>{ev.titulo}</h3>
                  <p>
                    {ev.hora} · {ev.disciplina}
                  </p>
                </div>
                <span className={`badge ${ev.prioridade.toLowerCase()}`}>
                  {ev.prioridade}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
