import React, { useState, useEffect } from "react";
import { useAuth } from "../../Controllers/authController";
import { authService } from "../../Services/authService";
import "../../Assets/Styles/Pages/Perfil.css";

export default function Perfil() {
  const { usuario, setUsuario } = useAuth();
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setNome(usuario?.nome || "");
  }, [usuario]);

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    setMensagem("");
    if (!nome.trim()) return setErro("O nome não pode ficar vazio.");

    setSalvando(true);
    try {
      const dados = await authService.atualizarPerfil({ nome: nome.trim() });
      setUsuario((anterior) => ({ ...anterior, ...dados.usuario }));
      setMensagem("Perfil atualizado!");
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      setErro(typeof err === "string" ? err : "Erro ao atualizar o perfil.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="perfil-page">
      <h1 className="perfil-titulo">Meu Perfil</h1>

      <form className="perfil-form" onSubmit={salvar}>
        <div className="perfil-grupo">
          <label>Nome</label>
          <input
            type="text"
            maxLength={100}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="perfil-grupo">
          <label>E-mail</label>
          <input type="email" value={usuario?.email || ""} disabled />
          <small>O e-mail não pode ser alterado.</small>
        </div>

        {erro && <p className="perfil-erro">{erro}</p>}
        {mensagem && <p className="perfil-sucesso">{mensagem}</p>}

        <button type="submit" className="perfil-btn" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}