const jwt = require("jsonwebtoken");

const EXPIRACAO = "7d";

function segredo() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET não definido no .env");
  return s;
}

const gerarToken = (payload) => jwt.sign(payload, segredo(), { expiresIn: EXPIRACAO });
const verificarToken = (token) => jwt.verify(token, segredo());

module.exports = { gerarToken, verificarToken };