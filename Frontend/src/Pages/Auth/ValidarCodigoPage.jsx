import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Controllers/authController';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import Header from '../Auth/Components/layout/Header';
import styles from '../Auth/Styles/Login.css'; // Reaproveitando o estilo do card
import '../Auth/Styles/LoginForm.css';

export const ValidarCodigoPage = () => {
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();
  const { handleValidarCodigo, erro, loading } = useAuth();

  // Recupera o e-mail que o usuário digitou na tela anterior
  const emailInformado = localStorage.getItem('@App:reset_email') || 'seu e-mail';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resultado = await handleValidarCodigo(emailInformado, codigo);

    if (resultado.sucesso) {
      // Salva temporariamente o token que valida que o código estava certo
      localStorage.setItem('@App:reset_token', resultado.tokenTemporario);

      // Redireciona para a página de alteração/definição da nova senha
      navigate('/reset-password');
    }
  };

  return (
    <div className={styles.containerLogin}>
      <Header titulo="Verificar Código" />

      <div className={styles.cardLogin} style={{ maxWidth: '400px', margin: '40px auto' }}>
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Código de Segurança</h2>
          <p style={{ fontSize: '14px', marginBottom: '15px', color: '#666' }}>
            Insira o código enviado para <strong>{emailInformado}</strong> para prosseguir.
          </p>

          {erro && <div className="error-message">{erro}</div>}

          <article className="form-group">
            <Input
              type="text"
              name="codigo"
              placeholder="Digite o código de 6 dígitos"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              disabled={loading}
              maxLength={6}
              style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px' }}
            />
          </article>

          <Button type="submit" disabled={loading}>
            {loading ? 'Validando...' : 'Confirmar Código'}
          </Button>

          <article className="form-actions">
            <span onClick={() => navigate('/forgot-password')} style={{ cursor: 'pointer' }}>
              Voltar
            </span>
          </article>
        </form>
      </div>
    </div>
  );
};