import React from "react";
import { useAuth } from "../../Controllers/authController";
import "../../Assets/Styles/Pages/PerfilPage.css";

export default function PerfilPage() {
  // Pega os dados do usuário logado no Contexto
  const { usuario, handleLogout } = useAuth();

  // Mock dos dados que viriam do Back-end (para os cards e a foto)
  const dadosMock = {
    nome: usuario?.nome || "Michelle Oliveira",
    email: usuario?.email || "michelle@focusly.co",
    foto: "https://i.pravatar.cc/150?img=47",
    completas: 34,
    sequencia: "5 dias",
    focoTotal: "18.5 hrs",
  };

  // Estrutura de dados para as listas de opções
  const secoes = [
    {
      titulo: "CONTA",
      itens: [
        { id: "detalhes", icone: "👤", label: "Detalhes pessoais" },
        { id: "seguranca", icone: "🔐", label: "Segurança e Senha" },
        { id: "progresso", icone: "📈", label: "Meu Progresso" },
      ],
    },
    {
      titulo: "PREFERÊNCIAS",
      itens: [
        { id: "notificacoes", icone: "🔔", label: "Notificações" },
        { id: "integracoes", icone: "🔌", label: "Integrações" },
        { id: "aparencia", icone: "🎨", label: "Aparência" },
      ],
    },
    {
      titulo: "SUPORTE",
      itens: [
        { id: "ajuda", icone: "❓", label: "Ajuda & FAQ" },
        { id: "termos", icone: "📄", label: "Termos de Uso" },
      ],
    },
  ];

  return (
    <div className="perfil-container">
      <h1 className="perfil-page-title desktop-only">Meu perfil</h1>

      <div className="perfil-layout-grid">
        
        {/* COLUNA ESQUERDA: Cartão do Usuário */}
        <div className="perfil-col-esquerda">
          <div className="perfil-card-usuario">
            <div className="avatar-wrapper">
              <img src={dadosMock.foto} alt={dadosMock.nome} className="avatar-img" />
            </div>
            <h2>{dadosMock.nome}</h2>
            <p>{dadosMock.email}</p>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="perfil-stats-grid">
            <div className="stat-card">
              <span className="stat-valor roxo">{dadosMock.completas}</span>
              <span className="stat-label">Completas</span>
            </div>
            <div className="stat-card">
              <span className="stat-valor laranja">{dadosMock.sequencia}</span>
              <span className="stat-label">Sequência</span>
            </div>
            <div className="stat-card">
              <span className="stat-valor vermelho">{dadosMock.focoTotal}</span>
              <span className="stat-label">Foco total</span>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Listas de Opções */}
        <div className="perfil-col-direita">
          {secoes.map((secao) => (
            <div key={secao.titulo} className="perfil-secao">
              <h3 className="secao-titulo">{secao.titulo}</h3>
              <div className="secao-lista">
                {secao.itens.map((item, index) => (
                  <button 
                    key={item.id} 
                    className={`opcao-item ${index !== secao.itens.length - 1 ? 'com-borda' : ''}`}
                  >
                    <div className="opcao-esquerda">
                      <span className="opcao-icone">{item.icone}</span>
                      <span className="opcao-label">{item.label}</span>
                    </div>
                    <span className="opcao-seta">›</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Botão de Logout (Opcional, mas essencial) */}
          <button className="btn-logout-perfil" onClick={handleLogout}>
            Sair da conta
          </button>
        </div>

      </div>
    </div>
  );
}