import api from "./api";

export const notificacaoService = {
  listar: async () => {
    const res = await api.get("/notificacoes");
    return res.data; // { total, notificacoes, mensagem }
  },

  enviarPorEmail: async () => {
    const res = await api.post("/notificacoes/email");
    return res.data; // { message, enviado }
  },
};