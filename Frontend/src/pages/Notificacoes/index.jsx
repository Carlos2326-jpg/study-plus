import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notificacaoService } from "../../Services/notificacaoService";
import "./Notificacoes.css";

const ICONES = {
  tarefa_atrasada: "⏰",
  tarefa_prazo: "📌",
  meta_prazo: "🎯",
  meta_nao_atingida: "⚠️",
};

const ROTULO_NIVEL = { alta: "Urgente", media: "Atenção", baixa: "Em breve" };

export default function Notificacoes() {
  const navigate = useNavigate();
  const [dados, setDados] = useState({ total: 0, notificacoes: [], mensagem: null });
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [erro, setErro] = useState("");

  async function carregar() {
    setErro("");
    try {
      setDados(await notificacaoService.listar());
    } catch {
      setErro("Não foi possível carregar as notificações.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function enviarEmail() {
    setAviso("");
    setErro("");
    setEnviando(true);
    try {
      const resposta = await notificacaoService.enviarPorEmail();
      setAviso(resposta.message);
    } catch (err) {
      setErro(err.response?.data?.message || "Erro ao enviar o e-mail.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="notif-page">
      <div className="notif-header">
        <h1 className="notif-titulo">Notificações</h1>
        <div className="notif-acoes">
          <button className="notif-btn-sec" onClick={carregar}>Atualizar</button>
          <button
            className="notif-btn"
            onClick={enviarEmail}
            disabled={enviando || dados.total === 0}
          >
            {enviando ? "Enviando..." : "Enviar por e-mail"}
          </button>
        </div>
      </div>

      {aviso && <p className="notif-sucesso">{aviso}</p>}
      {erro && <p className="notif-erro">{erro}</p>}

      {carregando ? (
        <p className="notif-vazio">Carregando...</p>
      ) : dados.total === 0 ? (
        <div className="notif-vazio">
          <p>🎉</p>
          <p>{dados.mensagem || "Você não tem pendências no momento."}</p>
        </div>
      ) : (
        <div className="notif-lista">
          {dados.notificacoes.map((n) => (
            <div key={n.id} className={`notif-card nivel-${n.nivel}`}>
              <span className="notif-icone">{ICONES[n.tipo] || "🔔"}</span>
              <div className="notif-corpo">
                <span className="notif-nivel">{ROTULO_NIVEL[n.nivel]}</span>
                <p className="notif-mensagem">{n.mensagem}</p>
              </div>
              <button className="notif-btn-sec" onClick={() => navigate(n.link)}>
                Ver
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}