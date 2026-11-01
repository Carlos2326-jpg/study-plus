import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Controllers/authController';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import Header from '../../Components/layout/header';
import './Styles/ResetarSenhaPage.css';

export const ResetarSenhaPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleResetPassword, erro, loading } = useAuth();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [sucesso, setSucesso] = useState(false);

  // Extrai automaticamente o parâmetro '?token=...' vindo do e-mail
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('Token de recuperação inválido ou ausente.');
      return;
    }

    const foiRedefinida = await handleResetPassword(token, novaSenha, confirmarSenha);
    if (foiRedefinida) {
      setSucesso(true);
      setTimeout(() => {
        navigate('/login'); // Redireciona de volta após 3 segundos
      }, 3000);
    }
  };

  return (
    <div className="login-container">
      <Header titulo="Oi" />
      <div className="card-login" style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>

        {sucesso ? (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'green' }}>Senha alterada com sucesso!</h3>
            <p>Você será redirecionado para a página de login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <h2>Crie sua nova senha</h2>

            {erro && <div className="error-message">{erro}</div>}
            {!token && <div className="error-message">Aviso: Nenhum token de validação foi encontrado na URL.</div>}

            <article className="form-group">
              <Input
                type="password"
                name="novaSenha"
                placeholder="Nova Senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
            </article>

            <article className="form-group">
              <Input
                type="password"
                name="confirmarSenha"
                placeholder="Confirme a Nova Senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </article>

            <Button type="submit" disabled={loading || !token}>
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};