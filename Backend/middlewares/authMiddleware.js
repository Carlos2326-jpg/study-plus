const { validarToken } = require("../seguranca/tokenValidation");

function autenticar(req, res, next) {
  const r = validarToken(req.headers.authorization);
  if (!r.valido) return res.status(401).json({ message: r.motivo, erro: r.motivo });
  req.usuarioId = r.dados.id;
  next();
}

module.exports = { autenticar };