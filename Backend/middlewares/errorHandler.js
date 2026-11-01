// Rota inexistente
function naoEncontrado(req, res) {
  const message = `Rota não encontrada: ${req.method} ${req.originalUrl}`;
  res.status(404).json({ message, erro: message });
}

// Tratador global de erros (precisa ter 4 parâmetros)
function errorHandler(err, req, res, next) {
  // JSON inválido no corpo da requisição
  if (err.type === "entity.parse.failed") {
    const message = "JSON inválido no corpo da requisição.";
    return res.status(400).json({ message, erro: message });
  }

  console.error("ERRO:", err.message);
  const status = err.status || 500;
  const message = status === 500 ? "Erro interno do servidor." : err.message;
  res.status(status).json({ message, erro: message });
}

module.exports = { naoEncontrado, errorHandler };