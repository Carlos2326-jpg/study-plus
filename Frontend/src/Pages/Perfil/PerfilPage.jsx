import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Controllers/authController";
import { authService } from "../../Services/authService";
import { relatorioService } from "../../Services/relatorioService";
import "../../Assets/Styles/Pages/PerfilPage.css";

export default function PerfilPage() {
  const { usuario, setUsuario, handleLogout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Estados de Estatísticas
  const [stats, setStats] = useState({ completas: 0, sequencia: 0, focoTotal: 0 });
  const [carregando, setCarregando] = useState(true);

  // Estados dos Modais (Nova lógica)
  const [modalNomeAberto, setModalNomeAberto] = useState(false);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [modalAparenciaAberto, setModalAparenciaAberto] = useState(false);
  
  // Estados dos Campos
  const [novoNome, setNovoNome] = useState("");
  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Carrega as estatísticas
  useEffect(() => {
    const carregarStats = async () => {
      try {
        const resProd = await relatorioService.buscarProdutividade({});
        setStats({
          completas: resProd.data.tarefasConcluidas || 0,
          focoTotal: resProd.data.totalHoras || 0,
          sequencia: 0
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      } finally {
        setCarregando(false);
      }
    };
    carregarStats();
  }, []);

  // --- AÇÕES DE CONTA ---
  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result;
        await authService.atualizarPerfil({ foto_perfil: base64String });
        setUsuario((prev) => ({ ...prev, foto_perfil: base64String }));
      } catch (error) {
        alert("Erro ao atualizar a foto. Verifique se a coluna no banco é LONGTEXT.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSalvarNome = async () => {
    if (!novoNome.trim()) return alert("O nome não pode ficar vazio.");
    setSalvando(true);
    try {
      await authService.atualizarPerfil({ nome: novoNome });
      setUsuario((prev) => ({ ...prev, nome: novoNome }));
      setModalNomeAberto(false);
    } catch (error) {
      alert("Erro ao atualizar o nome.");
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarSenha = () => {
    // Aqui entraria a chamada para o Back-end (ex: api.put('/auth/senha', { senhaAntiga, novaSenha }))
    if (!senhaAntiga || !novaSenha) return alert("Preencha todos os campos.");
    if (novaSenha.length < 6) return alert("A nova senha deve ter no mínimo 6 caracteres.");
    
    setSalvando(true);
    setTimeout(() => {
      alert("Funcionalidade pronta no Front-end. Aguardando rota no Back-end.");
      setSalvando(false);
      setModalSenhaAberto(false);
      setSenhaAntiga("");
      setNovaSenha("");
    }, 1000);
  };

  // --- AÇÃO DE APARÊNCIA (Dark Mode) ---
  const toggleTema = (tema) => {
    if (tema === "escuro") {
      document.body.classList.add("dark-mode");
      localStorage.setItem("@App:tema", "escuro");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("@App:tema", "claro");
    }
    setModalAparenciaAberto(false);
  };

  // Aplica o tema salvo ao carregar a página
  useEffect(() => {
    const temaSalvo = localStorage.getItem("@App:tema");
    if (temaSalvo === "escuro") {
      document.body.classList.add("dark-mode");
    }
  }, []);

  // --- NAVEGAÇÃO ---
  const handleAcao = (id) => {
    if (id === "progresso") return navigate("/progresso");
    if (id === "notificacoes") return navigate("/notificacoes");
    if (id === "detalhes") {
      setNovoNome(usuario?.nome || "");
      setModalNomeAberto(true);
      return;
    }
    if (id === "seguranca") {
      setModalSenhaAberto(true);
      return;
    }
    if (id === "aparencia") {
      setModalAparenciaAberto(true);
      return;
    }
    alert("Em breve!");
  };

  const secoes = [
    { titulo: "CONTA", itens: [
      { id: "detalhes", icone: "👤", label: "Detalhes pessoais" },
      { id: "seguranca", icone: "🔐", label: "Segurança e Senha" },
      { id: "progresso", icone: "📈", label: "Meu Progresso" },
    ]},
    { titulo: "PREFERÊNCIAS", itens: [
      { id: "notificacoes", icone: "🔔", label: "Notificações" },
      { id: "integracoes", icone: "🔌", label: "Integrações" },
      { id: "aparencia", icone: "🎨", label: "Aparência" },
    ]},
    { titulo: "SUPORTE", itens: [
      { id: "ajuda", icone: "❓", label: "Ajuda & FAQ" },
      { id: "termos", icone: "📄", label: "Termos de Uso" },
    ]},
  ];

  return (
    <div className="perfil-container">
      <h1 className="perfil-page-title desktop-only">Meu perfil</h1>

      <div className="perfil-layout-grid">
        {/* COLUNA ESQUERDA */}
        <div className="perfil-col-esquerda">
          <div className="perfil-card-usuario">
            <div className="avatar-wrapper" style={{ position: "relative", cursor: "pointer" }} onClick={() => fileInputRef.current.click()}>
              {usuario?.foto_perfil ? (
                <img src={usuario.foto_perfil} alt={usuario.nome} className="avatar-img" />
              ) : (
                <div className="avatar-img" style={{ background: "var(--purple-suave)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "var(--purple-dark)" }}>
                  {usuario?.nome?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div style={{ position: "absolute", bottom: "0", right: "0", background: "var(--purple-dark)", borderRadius: "50%", padding: "6px", display: "flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              </div>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFotoChange} style={{ display: "none" }} />
            <h2>{usuario?.nome || "Carregando..."}</h2>
            <p>{usuario?.email}</p>
          </div>

          <div className="perfil-stats-grid">
            <div className="stat-card"><span className="stat-valor roxo">{carregando ? "-" : stats.completas}</span><span className="stat-label">Completas</span></div>
            <div className="stat-card"><span className="stat-valor laranja">{carregando ? "-" : stats.sequencia} dias</span><span className="stat-label">Sequência</span></div>
            <div className="stat-card"><span className="stat-valor vermelho">{carregando ? "-" : stats.focoTotal}h</span><span className="stat-label">Foco total</span></div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="perfil-col-direita">
          {secoes.map((secao) => (
            <div key={secao.titulo} className="perfil-secao">
              <h3 className="secao-titulo">{secao.titulo}</h3>
              <div className="secao-lista">
                {secao.itens.map((item, index) => (
                  <button key={item.id} className={`opcao-item ${index !== secao.itens.length - 1 ? 'com-borda' : ''}`} onClick={() => handleAcao(item.id)}>
                    <div className="opcao-esquerda"><span className="opcao-icone">{item.icone}</span><span className="opcao-label">{item.label}</span></div>
                    <span className="opcao-seta">›</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button className="btn-logout-perfil" onClick={handleLogout}>Sair da conta</button>
        </div>
      </div>

      {/* ================= MODAIS ================= */}

      {/* 1. Modal de Nome */}
      {modalNomeAberto && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="modal-content" style={{ background: "var(--branco)", padding: "2rem", borderRadius: "var(--raio-lg)", width: "100%", maxWidth: "400px" }}>
            <h2 style={{ color: "var(--purple-dark)", marginBottom: "1rem" }}>Editar Nome</h2>
            <input type="text" className="input-modal" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} style={{ marginBottom: "1rem", border: "1px solid var(--cinza-200)", padding: "0.5rem", width: "100%", borderRadius: "8px" }} />
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setModalNomeAberto(false)} className="btn-cancelar" style={{ padding: "0.5rem 1rem", background: "transparent", border: "none", cursor: "pointer", color: "var(--texto-secundario)" }}>Cancelar</button>
              <button onClick={handleSalvarNome} className="btn-salvar" disabled={salvando} style={{ padding: "0.5rem 1.5rem", background: "var(--purple-dark)", color: "white", border: "none", borderRadius: "var(--raio)", cursor: "pointer" }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal de Senha */}
      {modalSenhaAberto && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="modal-content" style={{ background: "var(--branco)", padding: "2rem", borderRadius: "var(--raio-lg)", width: "100%", maxWidth: "400px" }}>
            <h2 style={{ color: "var(--purple-dark)", marginBottom: "0.5rem" }}>Alterar Senha</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--texto-secundario)", marginBottom: "1.5rem" }}>Sua nova senha deve ter no mínimo 6 caracteres.</p>
            
            <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Senha Atual</label>
            <input type="password" className="input-modal" value={senhaAntiga} onChange={(e) => setSenhaAntiga(e.target.value)} style={{ marginBottom: "1rem", marginTop: "0.25rem", border: "1px solid var(--cinza-200)", padding: "0.5rem", width: "100%", borderRadius: "8px" }} />
            
            <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Nova Senha</label>
            <input type="password" className="input-modal" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} style={{ marginBottom: "1rem", marginTop: "0.25rem", border: "1px solid var(--cinza-200)", padding: "0.5rem", width: "100%", borderRadius: "8px" }} />

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button onClick={() => setModalSenhaAberto(false)} className="btn-cancelar" style={{ padding: "0.5rem 1rem", background: "transparent", border: "none", cursor: "pointer", color: "var(--texto-secundario)" }}>Cancelar</button>
              <button onClick={handleSalvarSenha} className="btn-salvar" disabled={salvando} style={{ padding: "0.5rem 1.5rem", background: "var(--purple-dark)", color: "white", border: "none", borderRadius: "var(--raio)", cursor: "pointer" }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal de Aparência */}
      {modalAparenciaAberto && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="modal-content" style={{ background: "var(--branco)", padding: "2rem", borderRadius: "var(--raio-lg)", width: "100%", maxWidth: "400px" }}>
            <h2 style={{ color: "var(--purple-dark)", marginBottom: "1.5rem" }}>Aparência</h2>
            
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <button 
                onClick={() => toggleTema("claro")} 
                style={{ flex: 1, padding: "1rem", border: "2px solid var(--cinza-200)", borderRadius: "8px", background: "#FFF", color: "#333", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
              >
                <span style={{ fontSize: "1.5rem" }}>☀️</span>
                Modo Claro
              </button>
              
              <button 
                onClick={() => toggleTema("escuro")} 
                style={{ flex: 1, padding: "1rem", border: "2px solid var(--cinza-200)", borderRadius: "8px", background: "#1E1E2E", color: "#FFF", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
              >
                <span style={{ fontSize: "1.5rem" }}>🌙</span>
                Modo Escuro
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setModalAparenciaAberto(false)} className="btn-cancelar" style={{ padding: "0.5rem 1rem", background: "transparent", border: "none", cursor: "pointer", color: "var(--texto-secundario)" }}>Fechar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}