const crypto = require("crypto");
const UsuarioModel = require("../entidades/usuarioModel");
const ErroNegocio = require("./ErroNegocio");
const NotificacaoService = require("./NotificacaoService");
const { gerarHash, compararSenha } = require("../../seguranca/hashService");
const { gerarToken, verificarToken } = require("../../seguranca/jwtService");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MINIMA = 6;
const VALIDADE_CODIGO_MIN = 15;
const MAX_TENTATIVAS = 5;

async function registrar({ nome, email, senha }) {
  nome = String(nome || "").trim();
  email = String(email || "").trim().toLowerCase();

  if (!nome || !email || !senha)
    throw new ErroNegocio(400, "Todos os campos são obrigatórios.");
  if (!EMAIL_REGEX.test(email)) throw new ErroNegocio(400, "E-mail inválido.");
  if (String(senha).length < SENHA_MINIMA)
    throw new ErroNegocio(400, `A senha deve ter no mínimo ${SENHA_MINIMA} caracteres.`);
  if (await UsuarioModel.buscarPorEmail(email))
    throw new ErroNegocio(409, "E-mail já cadastrado.");

  const senha_hash = await gerarHash(senha);
  const usuario = await UsuarioModel.criar({ nome, email, senha_hash });
  return { token: gerarToken({ id: usuario.id }), usuario };
}

async function login({ email, senha }) {
  email = String(email || "").trim().toLowerCase();
  if (!email || !senha) throw new ErroNegocio(400, "E-mail e senha são obrigatórios.");

  const usuario = await UsuarioModel.buscarPorEmail(email);
  // Mesma mensagem nos dois casos, para não revelar se o e-mail existe
  if (!usuario || !(await compararSenha(senha, usuario.senha_hash)))
    throw new ErroNegocio(401, "Credenciais inválidas.");

  return {
    token: gerarToken({ id: usuario.id }),
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  };
}

async function obterPerfil(usuarioId) {
  const usuario = await UsuarioModel.buscarPorId(usuarioId);
  if (!usuario) throw new ErroNegocio(404, "Usuário não encontrado.");
  return usuario;
}

async function atualizarPerfil(usuarioId, { nome, foto_perfil }) {
  const atual = await obterPerfil(usuarioId);
  const novoNome = nome === undefined ? atual.nome : String(nome).trim();
  if (!novoNome) throw new ErroNegocio(400, "O nome não pode ficar vazio.");

  await UsuarioModel.atualizarPerfil(usuarioId, {
    nome: novoNome,
    foto_perfil: foto_perfil === undefined ? atual.foto_perfil : foto_perfil,
  });
  return obterPerfil(usuarioId);
  
}
async function solicitarRecuperacao({ email }) {
  email = String(email || "").trim().toLowerCase();
  if (!email) throw new ErroNegocio(400, "Informe o seu e-mail.");

  const usuario = await UsuarioModel.buscarPorEmail(email);
  if (usuario) {
    const codigo = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    await UsuarioModel.salvarCodigoRecuperacao(usuario.id, await gerarHash(codigo), VALIDADE_CODIGO_MIN);
    await NotificacaoService.enviarEmail({
      para: usuario.email,
      assunto: "Study+ - Código de recuperação de senha",
      texto: `Seu código de verificação é: ${codigo}\nEle expira em ${VALIDADE_CODIGO_MIN} minutos.\nSe você não solicitou, ignore este e-mail.`,
    });
  }
  // Mesma resposta exista o e-mail ou não, para não revelar quem tem conta
  return { message: "Se o e-mail estiver cadastrado, enviaremos um código de verificação." };
}

async function validarCodigo({ email, codigo }) {
  email = String(email || "").trim().toLowerCase();
  codigo = String(codigo || "").trim();
  const invalido = () => new ErroNegocio(400, "Código inválido ou expirado.");

  const usuario = await UsuarioModel.buscarPorEmail(email);
  if (!usuario) throw invalido();

  const ativo = await UsuarioModel.buscarCodigoAtivo(usuario.id);
  if (!ativo || ativo.codigo_tentativas >= MAX_TENTATIVAS) throw invalido();

  if (!(await compararSenha(codigo, ativo.codigo_recuperacao))) {
    await UsuarioModel.registrarTentativaCodigo(usuario.id);
    throw invalido();
  }

  await UsuarioModel.limparCodigoRecuperacao(usuario.id);
  return { tokenTemporario: gerarToken({ id: usuario.id, finalidade: "reset" }, "15m") };
}

async function redefinirSenha({ token, senha }) {
  if (!token || !senha) throw new ErroNegocio(400, "Token e nova senha são obrigatórios.");
  if (String(senha).length < SENHA_MINIMA)
    throw new ErroNegocio(400, `A senha deve ter no mínimo ${SENHA_MINIMA} caracteres.`);

  let dados;
  try {
    dados = verificarToken(token);
  } catch {
    throw new ErroNegocio(400, "Token inválido ou expirado.");
  }
  if (dados.finalidade !== "reset") throw new ErroNegocio(400, "Token inválido ou expirado.");

  await UsuarioModel.atualizarSenha(dados.id, await gerarHash(senha));
  return { message: "Senha redefinida com sucesso." };
}

module.exports = {
  registrar, login, obterPerfil, atualizarPerfil,
  solicitarRecuperacao, validarCodigo, redefinirSenha,
};