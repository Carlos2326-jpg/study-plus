const { verificarToken } = require("./jwtService");

function extrairToken(header) {
  if (!header) return null;
  const [tipo, token] = header.split(" ");
  return tipo === "Bearer" && token ? token : null;
}

function validarToken(header) {
  const token = extrairToken(header);
  if (!token) return { valido: false, motivo: "Token não fornecido." };
  try {
    return { valido: true, dados: verificarToken(token) };
  } catch {
    return { valido: false, motivo: "Token inválido ou expirado." };
  }
}

module.exports = { extrairToken, validarToken };