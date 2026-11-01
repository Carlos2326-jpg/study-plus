// ============================================================
// ROUTES - Auth
// Study+
// ============================================================

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "studyplus_secret_2026";

// Middleware de autenticação
const autenticar = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Token não fornecido." });
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuarioId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
};

// POST /auth/register
router.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });

  try {
    const [existe] = await db.query("SELECT id FROM Usuario WHERE email = ?", [email]);
    if (existe.length > 0)
      return res.status(409).json({ message: "E-mail já cadastrado." });

    const senha_hash = await bcrypt.hash(senha, 10);
    const [result] = await db.query(
      "INSERT INTO Usuario (nome, email, senha_hash) VALUES (?, ?, ?)",
      [nome, email, senha_hash]
    );

    const usuario = { id: result.insertId, nome, email };
    const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, usuario });
  } catch (err) {
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ message: "E-mail e senha são obrigatórios." });

  try {
    const [rows] = await db.query("SELECT * FROM Usuario WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: "Credenciais inválidas." });

    const usuario = rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta)
      return res.status(401).json({ message: "Credenciais inválidas." });

    const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (err) {
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

// GET /auth/me
router.get("/me", autenticar, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nome, email, foto_perfil, criado_em FROM Usuario WHERE id = ?",
      [req.usuarioId]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Usuário não encontrado." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

// PUT /auth/me
router.put("/me", autenticar, async (req, res) => {
  const { nome, foto_perfil } = req.body;
  try {
    await db.query(
      "UPDATE Usuario SET nome = ?, foto_perfil = ? WHERE id = ?",
      [nome, foto_perfil, req.usuarioId]
    );
    res.json({ message: "Perfil atualizado com sucesso." });
  } catch (err) {
    res.status(500).json({ message: "Erro interno.", erro: err.message });
  }
});

module.exports = router;
module.exports.autenticar = autenticar;