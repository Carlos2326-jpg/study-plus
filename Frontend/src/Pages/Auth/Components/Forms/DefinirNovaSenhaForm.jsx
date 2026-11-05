import React, { useState } from 'react';
import { useAuth } from '../../../../Controllers/authController';
import Button from '../../../../Components/ui/Button';
import Input from '../../../../Components/ui/Input';
import '../../Styles/LoginForm.css';

export const DefinirNovaSenhaForm = ({ tokenTemporario, onSucesso }) => {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const { handleResetPassword, erro, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Executa a redefinição passando o token que o passo do código liberou
    const sucesso = await handleResetPassword(tokenTemporario, novaSenha, confirmarSenha);
    if (sucesso) {
      onSucesso();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Criar Nova Senha</h2>
      <p style={{ fontSize: '14px', marginBottom: '15px', color: '#666' }}>
        Escolha uma senha segura de no mínimo 6 caracteres.
      </p>

      {erro && <div className="error-message">{erro}</div>}

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

      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Alterar Senha'}
      </Button>
    </form>
  );
};