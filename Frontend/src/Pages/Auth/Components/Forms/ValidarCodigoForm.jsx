import React, { useState } from 'react';
import { useAuth } from '../../../../Controllers/authController';
import Button from '../../../../Components/ui/Button';
import Input from '../../../../Components/ui/Input';
import '../../Styles/LoginForm.css';

export const ValidarCodigoForm = ({ email, onCodigoValido, onVoltar }) => {
  const [codigo, setCodigo] = useState('');
  const { handleValidarCodigo, erro, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Envia o e-mail (guardado do passo anterior) e o código digitado
    const resultado = await handleValidarCodigo(email, codigo);

    if (resultado.sucesso) {
      // Avança para a próxima etapa (Digitar Nova Senha) passando o token validado
      onCodigoValido(resultado.tokenTemporario);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Verificação de Segurança</h2>
      <p style={{ fontSize: '14px', marginBottom: '15px', color: '#666' }}>
        Enviamos um código de confirmação para o e-mail: <br />
        <strong>{email}</strong>. Digite-o abaixo para continuar.
      </p>

      {erro && <div className="error-message">{erro}</div>}

      <article className="form-group">
        <Input
          type="text"
          name="codigo"
          placeholder="Digite o código (Ex: 123456)"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          disabled={loading}
          maxLength={6}
          style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px' }}
        />
      </article>

      <Button type="submit" disabled={loading}>
        {loading ? 'Verificando...' : 'Verificar Código'}
      </Button>

      <article className="form-actions">
        <span onClick={onVoltar} style={{ cursor: 'pointer' }}>
          Voltar
        </span>
      </article>
    </form>
  );
};