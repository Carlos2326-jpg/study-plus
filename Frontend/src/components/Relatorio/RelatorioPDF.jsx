// PDF do relatório de Progresso (react-pdf)

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Paleta Focusly (Roxo)
const COR = {
  primaria: "#3D2C5E", // Roxo Escuro
  texto: "#111827",
  suave: "#6B7280",
  borda: "#E5E7EB",
  fundo: "#F8F6FC",
  destaque: "#8A6FB5",
  ambar: "#f59e0b",
};

const e = StyleSheet.create({
  pagina: {
    padding: 36,
    paddingBottom: 48,
    fontSize: 10,
    color: COR.texto,
    fontFamily: "Helvetica",
  },
  topo: {
    borderBottomWidth: 2,
    borderBottomColor: COR.primaria,
    paddingBottom: 8,
    marginBottom: 14,
  },
  titulo: { fontSize: 20, fontFamily: "Helvetica-Bold", color: COR.primaria },
  sub: { fontSize: 10, color: COR.suave, marginTop: 3 },
  secao: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 16,
    marginBottom: 6,
  },
  cards: { flexDirection: "row", marginHorizontal: -4 },
  card: {
    flex: 1,
    backgroundColor: COR.fundo,
    borderRadius: 4,
    padding: 8,
    marginHorizontal: 4,
  },
  cardValor: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: COR.primaria,
  },
  cardLabel: { fontSize: 8, color: COR.suave, marginTop: 2 },
  linhaBarra: { marginBottom: 6 },
  linhaBarraTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  trilho: { height: 7, backgroundColor: COR.borda, borderRadius: 3 },
  fill: { height: 7, borderRadius: 3 },
  graf: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 90,
    borderBottomWidth: 1,
    borderBottomColor: COR.borda,
  },
  grafBarra: { flex: 1, marginHorizontal: 1, backgroundColor: COR.primaria },
  grafEixo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
  },
  eixoTxt: { fontSize: 8, color: COR.suave },
  th: {
    flexDirection: "row",
    backgroundColor: COR.fundo,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tr: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COR.borda,
  },
  thTxt: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    backgroundColor: COR.fundo,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  vazio: { color: COR.suave, fontSize: 10, marginTop: 4 },
  rodape: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: COR.suave,
  },
});

const ESTADO_LABEL = {
  pendente: "Pendentes",
  em_andamento: "Em andamento",
  concluida: "Concluídas",
  bloqueada: "Bloqueadas",
};

const diaBR = (d) => (d ? d.split("-").reverse().join("/") : "");

function prepararEvolucao(evolucao = []) {
  if (evolucao.length <= 31)
    return evolucao.map((p) => ({ rotulo: p.data, horas: p.horas }));
  const grupos = [];
  for (let i = 0; i < evolucao.length; i += 7) {
    const bloco = evolucao.slice(i, i + 7);
    grupos.push({
      rotulo: bloco[0].data,
      horas: Math.round(bloco.reduce((s, p) => s + p.horas, 0) * 100) / 100,
    });
  }
  return grupos;
}

function BarraHoras({ nome, horas, percentual, cor }) {
  return (
    <View style={e.linhaBarra} wrap={false}>
      <View style={e.linhaBarraTopo}>
        <Text>{nome}</Text>
        <Text>
          {horas}h ({percentual}%)
        </Text>
      </View>
      <View style={e.trilho}>
        <View
          style={[
            e.fill,
            { width: `${Math.min(100, percentual)}%`, backgroundColor: cor },
          ]}
        />
      </View>
    </View>
  );
}

export default function RelatorioPDF({
  produtividade,
  graficos,
  periodoTexto,
  disciplinaTexto,
}) {
  const geradoEm = new Date().toLocaleString("pt-BR");
  const semDados = produtividade?.semDados;
  const evolucao = prepararEvolucao(graficos?.evolucao);
  const maxHoras = Math.max(0.01, ...evolucao.map((p) => p.horas));
  const semanal = (graficos?.evolucao?.length || 0) > 31;
  const sessoes = (produtividade?.sessoes || []).slice(0, 30);
  const cores = [COR.primaria, COR.ambar, COR.destaque, "#ef4444", "#06b6d4"];

  return (
    <Document title="Relatório de Progresso - Focusly" author="Focusly">
      <Page size="A4" style={e.pagina}>
        <View style={e.topo}>
          <Text style={e.titulo}>Focusly - Relatório de Progresso</Text>
          <Text style={e.sub}>
            Período: {periodoTexto} | Disciplina: {disciplinaTexto} | Gerado em{" "}
            {geradoEm}
          </Text>
        </View>

        {semDados ? (
          <Text style={e.vazio}>
            {produtividade?.mensagem ||
              "Não há dados de estudo para o período selecionado."}
          </Text>
        ) : (
          <>
            {/* Resumo */}
            <View style={e.cards}>
              <View style={e.card}>
                <Text style={e.cardValor}>{produtividade.totalHoras}h</Text>
                <Text style={e.cardLabel}>Total estudado</Text>
              </View>
              <View style={e.card}>
                <Text style={e.cardValor}>{produtividade.totalSessoes}</Text>
                <Text style={e.cardLabel}>Sessões realizadas</Text>
              </View>
              <View style={e.card}>
                <Text style={e.cardValor}>
                  {produtividade.disciplinaMaisEstudada || "-"}
                </Text>
                <Text style={e.cardLabel}>Disciplina mais estudada</Text>
              </View>
              <View style={e.card}>
                <Text style={e.cardValor}>
                  {produtividade.tarefasConcluidas}/{produtividade.totalTarefas}
                </Text>
                <Text style={e.cardLabel}>Tarefas concluídas</Text>
              </View>
            </View>

            {/* Horas por disciplina */}
            <Text style={e.secao}>Horas por disciplina</Text>
            {produtividade.distribuicao.length === 0 ? (
              <Text style={e.vazio}>Sem horas por disciplina no período.</Text>
            ) : (
              produtividade.distribuicao.map((d, i) => (
                <BarraHoras
                  key={d.disciplina}
                  nome={d.disciplina}
                  horas={d.horas}
                  percentual={d.percentual}
                  cor={cores[i % cores.length]}
                />
              ))
            )}

            {/* Evolução */}
            {evolucao.length > 0 && (
              <View wrap={false}>
                <Text style={e.secao}>
                  Evolução do tempo de estudo{" "}
                  {semanal ? "(horas por semana)" : "(horas por dia)"}
                </Text>
                <View style={e.graf}>
                  {evolucao.map((p) => (
                    <View
                      key={p.rotulo}
                      style={[
                        e.grafBarra,
                        {
                          height: `${Math.max(1, (p.horas / maxHoras) * 100)}%`,
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={e.grafEixo}>
                  <Text style={e.eixoTxt}>{diaBR(evolucao[0].rotulo)}</Text>
                  <Text style={e.eixoTxt}>Máximo: {maxHoras}h</Text>
                  <Text style={e.eixoTxt}>
                    {diaBR(evolucao[evolucao.length - 1].rotulo)}
                  </Text>
                </View>
              </View>
            )}

            {/* Sessões */}
            <Text style={e.secao}>Sessões do período</Text>
            <View style={e.th} fixed>
              <Text style={[e.thTxt, { width: "28%" }]}>Data</Text>
              <Text style={[e.thTxt, { width: "30%" }]}>Disciplina</Text>
              <Text style={[e.thTxt, { width: "20%" }]}>Técnica</Text>
              <Text style={[e.thTxt, { width: "12%" }]}>Duração</Text>
              <Text style={[e.thTxt, { width: "10%" }]}>Pausas</Text>
            </View>
            {sessoes.map((s) => (
              <View key={s.id} style={e.tr} wrap={false}>
                <Text style={{ width: "28%" }}>
                  {s.inicio ? new Date(s.inicio).toLocaleString("pt-BR") : "-"}
                </Text>
                <Text style={{ width: "30%" }}>{s.disciplina}</Text>
                <Text style={{ width: "20%" }}>{s.tecnica_usada || "-"}</Text>
                <Text style={{ width: "12%" }}>
                  {s.duracao_minutos ?? 0} min
                </Text>
                <Text style={{ width: "10%" }}>{s.pausas ?? 0}</Text>
              </View>
            ))}
            {produtividade.sessoes.length > sessoes.length && (
              <Text style={e.vazio}>
                Mostrando as {sessoes.length} sessões mais recentes de{" "}
                {produtividade.sessoes.length}.
              </Text>
            )}
          </>
        )}

        {/* Tarefas por estado */}
        {graficos?.tarefasPorEstado?.length > 0 && (
          <View wrap={false}>
            <Text style={e.secao}>Tarefas por estado</Text>
            <View style={e.chips}>
              {graficos.tarefasPorEstado.map((t) => (
                <View key={t.estado} style={e.chip}>
                  <Text>
                    {t.total} {ESTADO_LABEL[t.estado] || t.estado}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Metas */}
        {graficos?.progresso?.length > 0 && (
          <View>
            <Text style={e.secao}>Metas - progresso atual</Text>
            {graficos.progresso.map((m, i) => (
              <View
                key={`${m.disciplina}-${i}`}
                style={e.linhaBarra}
                wrap={false}
              >
                <View style={e.linhaBarraTopo}>
                  <Text>{m.disciplina}</Text>
                  <Text>
                    {m.cumprido}h de {m.alvo}h ({m.percentual}%)
                  </Text>
                </View>
                <View style={e.trilho}>
                  <View
                    style={[
                      e.fill,
                      {
                        width: `${Math.min(100, m.percentual)}%`,
                        backgroundColor:
                          m.percentual >= 100
                            ? "#16a34a"
                            : m.percentual >= 50
                              ? COR.ambar
                              : COR.primaria,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={e.rodape} fixed>
          <Text>Focusly</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
