import React, { useState } from "react";
import "../../Assets/Styles/Pages/Notificacoes.css";

export default function Notificacoes() {
  // Mock de notificações para visualização (depois você integra com a API)
  const [notificacoes, setNotificacoes] = useState([
    {
      id: 1,
      titulo: "Tarefa atrasada",
      mensagem: 'A tarefa "Revisar protótipo Focusly" está atrasada há 2 dias.',
      tempo: "Há 2 horas",
      lida: false,
      tipo: "alerta", // alerta, info, sucesso
    },
    {
      id: 2,
      titulo: "Meta quase atingida",
      mensagem: "Você está a apenas 2 horas de bater sua meta semanal de Matemática.",
      tempo: "Há 5 horas",
      lida: false,
      tipo: "info",
    },
    {
      id: 3,
      titulo: "Sessão concluída",
      mensagem: "Você focou por 45 minutos na disciplina de Física. Bom trabalho!",
      tempo: "Ontem",
      lida: true,
      tipo: "sucesso",
    },
  ]);

  const marcarComoLida = (id) => {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  };

  const limparTodas = () => {
    setNotificacoes([]);
  };

  return (
    <div className="notif-container">
      
      {/* Header */}
      <div className="notif-header">
        <div>
          <h1>Notificações</h1>
          <p>Fique por dentro de tudo que acontece no seu espaço.</p>
        </div>
        {notificacoes.length > 0 && (
          <button className="btn-limpar" onClick={limparTodas}>
            Limpar tudo
          </button>
        )}
      </div>

      {/* Lista de Notificações */}
      <div className="notif-lista">
        {notificacoes.length === 0 ? (
          <div className="notif-empty">
            <span className="notif-icon">🔔</span>
            <h2>Tudo em dia!</h2>
            <p>Você não tem nenhuma notificação no momento.</p>
          </div>
        ) : (
          notificacoes.map((notif) => (
            <div 
              key={notif.id} 
              className={`notif-card ${notif.lida ? "lida" : "nao-lida"}`}
              onClick={() => !notif.lida && marcarComoLida(notif.id)}
            >
              <div className={`notif-indicador ${notif.tipo}`}></div>
              
              <div className="notif-conteudo">
                <div className="notif-topo">
                  <h3>{notif.titulo}</h3>
                  <span className="notif-tempo">{notif.tempo}</span>
                </div>
                <p>{notif.mensagem}</p>
              </div>

              {!notif.lida && <div className="notif-bolinha"></div>}
            </div>
          ))
        )}
      </div>

    </div>
  );
}