const bcrypt = require("bcryptjs");

const gerarHash = (senha) => bcrypt.hash(String(senha), 10);
const compararSenha = (senha, hash) => bcrypt.compare(String(senha), hash);

module.exports = { gerarHash, compararSenha };