import api from './api';

export const authService = {
  login: async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Erro ao realizar login.';
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Sessão inválida.';
    }
  },

  atualizarPerfil: async (dados) => {
    try {
      const response = await api.put('/auth/me', dados);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Erro ao atualizar o perfil.';
    }
  },

  register: async (nome, email, senha) => {
    try {
      const response = await api.post('/auth/register', { nome, email, senha });
      return response.data;
    } catch (error) {
      // O back-end envia { message, erro }. Vamos pegar a mensagem exata.
      throw error.response?.data?.message || 'Erro ao criar conta.';
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Erro ao processar solicitação.';
    }
  },

  validateCode: async (email, codigo) => {
    try {
      const response = await api.post('/auth/validate-code', { email, codigo });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Código inválido ou expirado.';
    }
  },

  resetPassword: async (token, senha) => {
    try {
      const response = await api.post('/auth/reset-password', { token, senha });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Erro ao redefinir a senha.';
    }
  },
};