// Uso: router.post("/", exigirCampos(["titulo"]), controller)
function exigirCampos(campos) {
  return (req, res, next) => {
    const faltando = campos.filter((c) => {
      const v = req.body?.[c];
      return v === undefined || v === null || String(v).trim() === "";
    });
    if (faltando.length > 0) {
      const message = `Campo(s) obrigatório(s): ${faltando.join(", ")}.`;
      return res.status(400).json({ message, erro: message });
    }
    next();
  };
}

// Garante que :id seja um número positivo
function validarId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    const message = "ID inválido.";
    return res.status(400).json({ message, erro: message });
  }
  next();
}

module.exports = { exigirCampos, validarId };