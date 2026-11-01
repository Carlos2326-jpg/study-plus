import React, { useState, useEffect } from "react";
import { disciplinaService } from "../../Services/disciplinaService";
import "./Disciplinas.css";

export default function Disciplinas() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      setDisciplinas(await disciplinaService.listar());
    } catch {
      setErro("Não foi possível carregar as disciplinas.");
    }
  }

  function cancelar() {
    setMostrarForm(false);
    setNome("");
    setDescricao("");
    setErro("");
  }

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) return setErro("Informe o nome da disciplina.");
    try {
      await disciplinaService.criar(nome.trim(), descricao.trim());
      cancelar();
      setMensagem("Disciplina criada!");
      await carregar();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      setErro(err.response?.data?.message || "Erro ao criar disciplina.");
    }
  }

  return (
    <div className="disc-page">
      <div className="disc-header">
        <h1 className="disc-titulo">Disciplinas</h1>
        <button className="disc-btn-nova" onClick={() => setMostrarForm(true)}>
          + Nova Disciplina
        </button>
      </div>

      {mensagem && <p className="disc-sucesso">{mensagem}</p>}

      {mostrarForm && (
        <form className="disc-form" onSubmit={salvar}>
          <h2>Nova Disciplina</h2>

          <div className="disc-grupo">
            <label>Nome</label>
            <input
              type="text"
              maxLength={100}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Matemática"
              autoFocus
            />
          </div>

          <div className="disc-grupo">
            <label>Descrição (opcional)</label>
            <textarea
              rows={3}
              maxLength={255}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex.: Cálculo 1"
            />
          </div>

          {erro && <p className="disc-erro">{erro}</p>}

          <div className="disc-acoes">
            <button type="submit" className="disc-btn-salvar">Criar disciplina</button>
            <button type="button" className="disc-btn-cancelar" onClick={cancelar}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!mostrarForm && erro && <p className="disc-erro">{erro}</p>}

      {disciplinas.length === 0 ? (
        <div className="disc-vazio">
          <p>Nenhuma disciplina cadastrada ainda.</p>
          <p>Crie a primeira para usar nas tarefas e cronogramas!</p>
        </div>
      ) : (
        <div className="disc-lista">
          {disciplinas.map((d) => (
            <div key={d.id} className="disc-card">
              <span className="disc-nome">{d.nome}</span>
              {d.descricao && <span className="disc-desc">{d.descricao}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}