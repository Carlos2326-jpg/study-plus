import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authService } from '../Services/authService';

const AuthContext = createContext({});

const TOKEN_KEY = '@App:token';
const RESET_EMAIL_KEY = '@App:reset_email';
const RESET_TOKEN_KEY = '@App:reset_token';

// Função auxiliar para extrair a mensagem de erro correta (seja string ou objeto do Axios)
const normalizarErro = (err, fallback = 'Erro inesperado. Tente novamente.') => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  return err.response?.data?.message || err.response?.data?.erro || err.message || fallback;
};

const limparSessao = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(RESET_EMAIL_KEY);
  localStorage.removeItem(RESET_TOKEN_KEY);
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Função de logout declarada antes do useEffect para evitar problemas de escopo
  const handleLogout = useCallback(() => {
    limparSessao();
    setUsuario(null);
  }, []);

  // Verifica se já existe um token salvo ao carregar o app
  useEffect(() => {
    const verificarSessao = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (token) {
        try {
          const dadosUsuario = await authService.getMe();
          setUsuario(dadosUsuario);
        } catch (err) {
          // Se o token estiver expirado ou inválido, limpa a sessão
          handleLogout();
        }
      }
      setLoading(false);
    };

    verificarSessao();
  }, [handleLogout]);

  // Lógica de execução do Login
  const handleLogin = async (email, senha) => {
    setErro('');
    setLoading(true);

    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos.');
      setLoading(false);
      return false;
    }

    try {
      const data = await authService.login(email, senha);
      localStorage.setItem(TOKEN_KEY, data.token);
      setUsuario(data.usuario);
      return true;
    } catch (err) {
      setErro(normalizarErro(err, 'Erro ao realizar login.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Cadastro
  const handleRegister = async (nome, email, senha, confirmarSenha) => {
    setErro('');
    setLoading(true);

    // Validações de Front-end (espelhando as regras do seu Back-end)
    if (!nome || !email || !senha || !confirmarSenha) {
      setErro('Todos os campos são obrigatórios.');
      setLoading(false);
      return false;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      setLoading(false);
      return false;
    }

    // O Back-end (AutenticacaoService.js) exige mínimo de 6 caracteres
    if (senha.length < 6) {
      setErro('A senha deve conter no mínimo 6 caracteres.');
      setLoading(false);
      return false;
    }

    try {
      const data = await authService.register(nome, email, senha);

      // Se o back-end já autenticar e retornar o token no cadastro
      if (data.token && data.usuario) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setUsuario(data.usuario);
      }
      return true;
    } catch (err) {
      // Aqui vai capturar a mensagem exata do back-end (ex: "E-mail já cadastrado.")
      setErro(normalizarErro(err, 'Erro ao criar conta.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Dispara o envio de e-mail de recuperação
  const handleForgotPassword = async (email) => {
    setErro('');
    setLoading(true);

    if (!email) {
      setErro('Por favor, informe o seu e-mail.');
      setLoading(false);
      return { sucesso: false, mensagem: 'E-mail obrigatório.' };
    }

    try {
      const data = await authService.forgotPassword(email);
      return { sucesso: true, mensagem: data.message || 'Link enviado com sucesso para o seu e-mail!' };
    } catch (err) {
      const mensagem = normalizarErro(err, 'Erro ao processar solicitação.');
      setErro(mensagem);
      return { sucesso: false, mensagem };
    } finally {
      setLoading(false);
    }
  };

  // Valida o código de 6 dígitos enviado por e-mail
  const handleValidarCodigo = async (email, codigo) => {
    setErro('');
    setLoading(true);

    if (!codigo || codigo.length < 4) {
      setErro('Por favor, insira o código de verificação completo.');
      setLoading(false);
      return { sucesso: false };
    }

    try {
      const data = await authService.validateCode(email, codigo);
      return { sucesso: true, tokenTemporario: data.tokenTemporario };
    } catch (err) {
      setErro(normalizarErro(err, 'Não foi possível validar o código.'));
      return { sucesso: false };
    } finally {
      setLoading(false);
    }
  };

  // Redefine a senha usando o token temporário
  const handleResetPassword = async (token, novaSenha, confirmarNovaSenha) => {
    setErro('');
    setLoading(true);

    if (!novaSenha || !confirmarNovaSenha) {
      setErro('Preencha os campos de senha.');
      setLoading(false);
      return false;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErro('As senhas não coincidem.');
      setLoading(false);
      return false;
    }

    if (novaSenha.length < 6) {
      setErro('A nova senha deve conter no mínimo 6 caracteres.');
      setLoading(false);
      return false;
    }

    try {
      await authService.resetPassword(token, novaSenha);
      return true;
    } catch (err) {
      setErro(normalizarErro(err, 'Erro ao redefinir a senha.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario,
        loading,
        erro,
        handleLogin,
        handleLogout,
        handleRegister,
        handleForgotPassword,
        handleValidarCodigo,
        handleResetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);