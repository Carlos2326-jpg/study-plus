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
};