import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notificacaoService } from "../../Services/notificacaoService";
import "../../Assets/Styles/Pages/Notificacoes.css";

export default function Notificacoes() {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarNotificacoes = async () => {
    setCarregando(true);
    setErro("");
    try {
      const res = await notificacaoService.listar();
      // O back-end retorna { total, notificacoes, mensagem }
      setNotificacoes(res.notificacoes || []);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      setErro("Não foi possível carregar as notificações.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  if (carregando) return <div className="loading-screen">Carregando notificações...</div>;

  return (
    <div className="notif-container">
      <div className="notif-header">
        <div>
          <h1>Notificações</h1>
          <p>Fique por dentro de tudo que acontece no seu espaço.</p>
        </div>
        <button className="btn-limpar" onClick={carregarNotificacoes}>
          Atualizar
        </button>
      </div>

      <div className="notif-lista">
        {erro ? (
          <div className="notif-empty">
            <h2>Ops!</h2>
            <p>{erro}</p>
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="notif-empty">
            <span className="notif-icon">🔔</span>
            <h2>Tudo em dia!</h2>
            <p>Você não tem nenhuma pendência no momento.</p>
          </div>
        ) : (
          notificacoes.map((notif) => (
            <div 
              key={notif.id} 
              className={`notif-card ${notif.nivel}`}
              style={{ borderLeftColor: notif.nivel === 'alta' ? 'var(--cor-alta-texto)' : notif.nivel === 'media' ? 'var(--cor-media-texto)' : 'var(--cor-baixa-texto)' }}
            >
              <div className="notif-conteudo">
                <div className="notif-topo">
                  <h3>{notif.tipo === 'tarefa_atrasada' ? '⏰ Tarefa Atrasada' : notif.tipo === 'meta_prazo' ? '🎯 Meta Próxima' : '⚠️ Aviso'}</h3>
                </div>
                <p>{notif.mensagem}</p>
              </div>
              <button 
                className="btn-limpar" 
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}
                onClick={() => navigate(notif.link || "/tarefas")}
              >
                Ver
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}