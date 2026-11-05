import api from "./api";

export const disciplinaService = {
  listar: async () => {
    const res = await api.get("/disciplinas");
    return res.data;
  },
  criar: async (nome, descricao = "") => {
    const res = await api.post("/disciplinas", { nome, descricao });
    return res.data;
  },
  atualizar: async (id, nome, descricao = "") => {
    const res = await api.put(`/disciplinas/${id}`, { nome, descricao });
    return res.data;
  },
  excluir: async (id) => {
    const res = await api.delete(`/disciplinas/${id}`);
    return res.data;
  },
};