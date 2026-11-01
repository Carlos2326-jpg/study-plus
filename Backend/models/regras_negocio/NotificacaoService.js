const nodemailer = require("nodemailer");

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

module.exports = { enviarEmail };