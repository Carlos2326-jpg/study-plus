import api from './api'; // Sua configuração do Axios

export const authService = {
  // Realiza a chamada de login e retorna os dados (Token e Usuário)
  login: async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      return response.data; // Espera-se { token: '...', usuario: { id, nome, email } }
    } catch (error) {
      // Lança o erro para ser capturado e tratado pelo Controller
      throw error.response?.data?.message || 'Erro ao realizar login. Tente novamente.';
    }
  },

  // Busca os dados do usuário logado usando o Token salvo
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Sessão inválida.';
    }
  },

  // Adicione este método dentro do objeto "authService" no seu src/services/authService.js

  // Realiza a chamada de cadastro de um novo usuário
  register: async (nome, email, senha) => {
    try {
      const response = await api.post('/auth/register', { nome, email, senha });
      return response.data; // Espera-se { token: '...', usuario: { id, nome, email } } ou mensagem de sucesso
    } catch (error) {
      // Captura mensagens de erro do servidor (ex: "E-mail já cadastrado")
      throw error.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
    }
  },

  // Adicione estes métodos dentro do objeto "authService" no seu src/services/authService.js

  // Passo 1: Envia o e-mail do usuário solicitando o link de recuperação
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data; // Espera-se uma mensagem de sucesso como { message: 'E-mail enviado' }
    } catch (error) {
      throw error.response?.data?.message || 'Erro ao processar solicitação de recuperação.';
    }
  },

  // Passo 2: Envia a nova senha acompanhada do token recebido por e-mail
  resetPassword: async (token, novaSenha) => {
    try {
      const response = await api.post('/auth/reset-password', { token, senha: novaSenha });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Erro ao redefinir a senha. Token inválido ou expirado.';
    }
  },
};