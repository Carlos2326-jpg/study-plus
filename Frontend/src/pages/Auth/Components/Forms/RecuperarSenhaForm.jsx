import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../Controllers/authController';
import Button from '../../../../Components/ui/Button';
import Input from '../../../../Components/ui/Input';
import '../../Styles/RecuperarSenhaForm.css';

export const RecuperarSenhaForm = ({ onVoltarLogin }) => {
  const [email, setEmail] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const navigate = useNavigate(); // 🔥 2. Inicialize o navigate aqui dentro

  const { handleForgotPassword, erro, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultado = await handleForgotPassword(email);

    if (resultado.sucesso) {
      // Guardamos o e-mail para a próxima tela saber qual é
      localStorage.setItem('@App:reset_email', email);

      // 🔥 Agora o sistema sabe o que fazer nesta linha!
      navigate('/validate-code');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Recuperar Senha</h2>
      <p style={{ fontSize: '14px', marginBottom: '15px', color: '#666' }}>
        Insira seu e-mail cadastrado e enviaremos um link seguro para criar uma nova senha.
      </p>

      {erro && <div className="error-message">{erro}</div>}
      {mensagemSucesso && <div className="success-message" style={{ color: 'green', marginBottom: '15px' }}>{mensagemSucesso}</div>}

      <article className="form-group">
        <Input
          type="email"
          name="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </article>

      <Button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Link'}
      </Button>

      <article className="form-actions">
        <span onClick={onVoltarLogin} style={{ cursor: 'pointer' }}>
          Voltar para o Login
        </span>
      </article>
    </form>
  );
};