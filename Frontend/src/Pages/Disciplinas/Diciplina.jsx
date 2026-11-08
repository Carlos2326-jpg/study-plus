import React, { useState, useEffect } from "react";
import { disciplinaService } from "../../Services/disciplinaService";
import "../../Assets/Styles/Pages/Disciplinas.css";

const mensagemDoErro = (e) => e?.response?.data?.message || e?.message || "Erro inesperado.";
const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;

export default function Disciplinas() {
  const [lista, setLista] = useState([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      setLista(await disciplinaService.listar());
    } catch (e) {
      setErro(mensagemDoErro(e));
    } finally {
      setCarregando(false);
    }
  }

  function avisar(texto) {
    setMensagem(texto);
    setTimeout(() => setMensagem(""), 3000);
  }

  function limpar() {
    setNome("");
    setDescricao("");
    setEditandoId(null);
    setErro("");
  }

  function editar(d) {
    setEditandoId(d.id);
    setNome(d.nome);
    setDescricao(d.descricao || "");
    setErro("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) {
      setErro("Informe o nome da disciplina.");
      return;
    }
    try {
      if (editandoId) {
        await disciplinaService.atualizar(editandoId, nome.trim(), descricao.trim());
        avisar("Disciplina atualizada!");
      } else {
        await disciplinaService.criar(nome.trim(), descricao.trim());
        avisar("Disciplina criada!");
      }
      limpar();
      await carregar();
    } catch (err) {
      setErro(mensagemDoErro(err));
    }
  }

  async function excluir(d) {
    setErro("");
    if (!window.confirm(`Excluir a disciplina "${d.nome}"?`)) return;
    try {
      await disciplinaService.excluir(d.id);
      if (editandoId === d.id) limpar();
      avisar("Disciplina excluída.");
      await carregar();
    } catch (err) {
      setErro(mensagemDoErro(err));
    }
  }

  return (
    <div className="disc-page">
      <h1 className="disc-titulo">Disciplinas</h1>

      <form className="disc-form" onSubmit={salvar}>
        <h2>{editandoId ? "Editar disciplina" : "Nova disciplina"}</h2>
        <input
          className="disc-input"
          type="text"
          placeholder="Nome da disciplina"
          maxLength={100}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          className="disc-input"
          type="text"
          placeholder="Descrição (opcional)"
          maxLength={255}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        {erro && <p className="disc-erro">{erro}</p>}
        <div className="disc-form-acoes">
          <button type="submit" className="disc-btn disc-btn-principal">
            {editandoId ? "Salvar alterações" : "Adicionar"}
          </button>
          {editandoId && (
            <button type="button" className="disc-btn" onClick={limpar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {mensagem && <p className="disc-sucesso">{mensagem}</p>}

      {carregando ? (
        <p className="disc-vazio">Carregando...</p>
      ) : lista.length === 0 ? (
        <p className="disc-vazio">Nenhuma disciplina cadastrada ainda.</p>
      ) : (
        <ul className="disc-lista">
          {lista.map((d) => (
            <li key={d.id} className="disc-item">
              <div className="disc-info">
                <strong>{d.nome}</strong>
                {d.descricao && <span className="disc-desc">{d.descricao}</span>}
                <span className="disc-vinculos">
                  {plural(d.total_tarefas ?? 0, "tarefa", "tarefas")} ·{" "}
                  {plural(d.total_cronogramas ?? 0, "cronograma", "cronogramas")}
                </span>
              </div>
              <div className="disc-acoes">
                <button className="disc-btn" onClick={() => editar(d)}>Editar</button>
                <button className="disc-btn disc-btn-perigo" onClick={() => excluir(d)}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}