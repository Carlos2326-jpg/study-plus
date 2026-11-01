const express = require("express");
const router = express.Router();
const { autenticar } = require("../middlewares/authMiddleware");
const { exigirCampos } = require("../middlewares/validationMiddleware");
const {
  registrar, login, logout, esqueciSenha, validarCodigo, redefinirSenha,
} = require("../controllers/authController");
const { obterPerfil, atualizarPerfil } = require("../controllers/usuarioController");

router.post("/register", exigirCampos(["nome", "email", "senha"]), registrar);
router.post("/login", exigirCampos(["email", "senha"]), login);
router.post("/logout", autenticar, logout);

router.post("/forgot-password", exigirCampos(["email"]), esqueciSenha);
router.post("/validate-code", exigirCampos(["email", "codigo"]), validarCodigo);
router.post("/reset-password", exigirCampos(["token", "senha"]), redefinirSenha);

// Mantidos por compatibilidade com o frontend atual
router.get("/me", autenticar, obterPerfil);
router.put("/me", autenticar, atualizarPerfil);

module.exports = router;