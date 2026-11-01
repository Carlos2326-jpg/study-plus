import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../Services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Verifica se já existe um token salvo ao carregar o app
  useEffect(() => {
    const verificarSessao = async () => {
      const token = localStorage.getItem('@App:token');

      if (token) {
        try {
          // Se houver token, busca os dados atualizados do usuário
          const dadosUsuario = await authService.getMe();
          setUsuario(dadosUsuario);
        } catch (err) {
          // Se o token estiver expirado, limpa tudo
          handleLogout();
        }
      }
      setLoading(false);
    };

    verificarSessao();
  }, []);

  // Lógica de execução do Login
  const handleLogin = async (email, senha) => {
    setErro('');
    setLoading(true);

    // Validação básica (Regra de Negócio no Front)
    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos.');
      setLoading(false);
      return false;
    }

    try {
      const data = await authService.login(email, senha);

      // Guarda o token no localStorage para persistir a sessão
      localStorage.setItem('@App:token', data.token);

      // Atualiza o estado com o usuário logado
      setUsuario(data.usuario);

      setLoading(false);
      return true; // Login efetuado com sucesso
    } catch (err) {
      setErro(err);
      setLoading(false);
      return false; // Falha no login
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@App:token');
    setUsuario(null);
  };

  const handleRegister = async (nome, email, senha, confirmarSenha) => {
    setErro('');
    setLoading(true);

    // Validações de Regra de Negócio no Front-end
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

    if (senha.length < 6) {
      setErro('A senha deve conter no mínimo 6 caracteres.');
      setLoading(false);
      return false;
    }

    try {
      const data = await authService.register(nome, email, senha);

      // Se o seu back-end já autenticar o usuário direto no cadastro trazendo o token:
      if (data.token && data.usuario) {
        localStorage.setItem('@App:token', data.token);
        setUsuario(data.usuario);
      }

      setLoading(false);
      return true; // Cadastro efetuado com sucesso
    } catch (err) {
      setErro(err);
      setLoading(false);
      return false; // Falha no cadastro
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
      setLoading(false);
      return { sucesso: true, mensagem: data.message || 'Link enviado com sucesso para o seu e-mail!' };
    } catch (err) {
      setErro(err);
      setLoading(false);
      return { sucesso: false, mensagem: err };
    }
  };

  // Dispara a redefinição de senha com o token
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
      setLoading(false);
      return true;
    } catch (err) {
      setErro(err);
      setLoading(false);
      return false;
    }
  };

  // Adicione esta função dentro do seu AuthProvider no src/controllers/authController.jsx

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
      setLoading(false);
      // Retorna o token temporário que o back-end gerou para permitir a troca de senha
      return { sucesso: true, tokenTemporario: data.tokenTemporario };
    } catch (err) {
      setErro(err);
      setLoading(false);
      return { sucesso: false };
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, erro, handleLogin, handleLogout, handleRegister, handleForgotPassword, handleResetPassword, handleValidarCodigo }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para as Views consumirem o Controller facilmente
export const useAuth = () => useContext(AuthContext);