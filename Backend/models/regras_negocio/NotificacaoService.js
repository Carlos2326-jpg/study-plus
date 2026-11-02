const nodemailer = require("nodemailer");
const NotificacaoModel = require("../entidades/notificacaoModel");
const MetaModel = require("../entidades/metaModel");
const UsuarioModel = require("../entidades/usuarioModel");

const DIAS_ALERTA = 3;        // tarefas/metas que vencem em até 3 dias
const DIAS_META_VENCIDA = 7;  // metas encerradas há até 7 dias ainda são avisadas

const ORDEM_NIVEL = { alta: 0, media: 1, baixa: 2 };
const dias = (n) => (Math.abs(n) === 1 ? "dia" : "dias");

// ---------- Envio de e-mail ----------
let transporter = null;

function obterTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

async function enviarEmail({ para, assunto, texto }) {
  const t = obterTransporter();
  // Sem SMTP configurado (ambiente de desenvolvimento), mostra no terminal
  if (!t) {
    console.log(`[E-MAIL SIMULADO] Para: ${para} | ${assunto}\n${texto}`);
    return;
  }
  await t.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: para,
    subject: assunto,
    text: texto,
  });
}

// ---------- Alertas (CU08) ----------
function alertaDeTarefa(t) {
  let mensagem, tipo, nivel;
  if (t.dias < 0) {
    tipo = "tarefa_atrasada";
    nivel = "alta";
    mensagem = `A tarefa "${t.titulo}" está atrasada há ${-t.dias} ${dias(t.dias)}.`;
  } else if (t.dias === 0) {
    tipo = "tarefa_prazo";
    nivel = "media";
    mensagem = `A tarefa "${t.titulo}" vence hoje.`;
  } else {
    tipo = "tarefa_prazo";
    nivel = t.dias === 1 ? "media" : "baixa";
    mensagem = `A tarefa "${t.titulo}" vence em ${t.dias} ${dias(t.dias)}.`;
  }
  return { id: `${tipo}-${t.id}`, tipo, nivel, mensagem, referencia_id: t.id, link: "/tarefas" };
}

async function alertaDeMeta(usuarioId, meta) {
  const minutos = await MetaModel.minutosEstudados(
    usuarioId, meta.disciplina, meta.data_inicio, meta.data_fim
  );
  const alvo = Number(meta.carga_horaria_alvo);
  const percentual = alvo > 0 ? Math.min(100, Math.round(((minutos / 60) / alvo) * 1000) / 10) : 0;

  if (percentual >= 100) return null; // meta atingida: sem alerta

  let tipo, nivel, mensagem;
  if (meta.dias < 0) {
    tipo = "meta_nao_atingida";
    nivel = "alta";
    mensagem = `A meta de "${meta.disciplina}" terminou com ${percentual}% da carga horária cumprida.`;
  } else {
    tipo = "meta_prazo";
    nivel = meta.dias <= 1 ? "media" : "baixa";
    const quando = meta.dias === 0 ? "hoje" : `em ${meta.dias} ${dias(meta.dias)}`;
    mensagem = `A meta de "${meta.disciplina}" termina ${quando} e está em ${percentual}%.`;
  }
  return { id: `${tipo}-${meta.id}`, tipo, nivel, mensagem, referencia_id: meta.id, link: "/metas" };
}

async function consultar(usuarioId) {
  const tarefas = await NotificacaoModel.tarefasComAlerta(usuarioId, DIAS_ALERTA);
  const metas = await NotificacaoModel.metasComAlerta(usuarioId, DIAS_ALERTA, DIAS_META_VENCIDA);

  const alertas = tarefas.map(alertaDeTarefa);
  for (const meta of metas) {
    const alerta = await alertaDeMeta(usuarioId, meta);
    if (alerta) alertas.push(alerta);
  }

  alertas.sort((a, b) => ORDEM_NIVEL[a.nivel] - ORDEM_NIVEL[b.nivel]);

  return {
    total: alertas.length,
    notificacoes: alertas,
    mensagem: alertas.length === 0 ? "Você não tem pendências no momento." : null,
  };
}

async function enviarPorEmail(usuarioId) {
  const { total, notificacoes, mensagem } = await consultar(usuarioId);
  if (total === 0) return { message: mensagem, enviado: false };

  const usuario = await UsuarioModel.buscarPorId(usuarioId);
  const linhas = notificacoes.map((n) => `- ${n.mensagem}`).join("\n");
  await enviarEmail({
    para: usuario.email,
    assunto: `Study+ - ${total} ${total === 1 ? "alerta" : "alertas"}`,
    texto: `Olá, ${usuario.nome}!\n\nEstes são os seus alertas:\n\n${linhas}\n`,
  });
  return { message: "Resumo enviado para o seu e-mail.", enviado: true };
}

module.exports = { enviarEmail, consultar, enviarPorEmail };