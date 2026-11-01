import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/layout/header';

// Importação dos 3 sub-formulários do funil
import { RecuperarSenhaForm } from './Components/Forms/RecuperarSenhaForm';
import { ValidarCodigoForm } from './Components/Forms/ValidarCodigoForm';
import { DefinirNovaSenhaForm } from './Components/Forms/DefinirNovaSenhaForm';

import styles from '../Auth/Styles/Login.css'; // Reaproveita o estilo do card de login

export const RecuperarSenhaPage = () => {
  const navigate = useNavigate();

  // Estados de controle do fluxo
  const [etapa, setEtapa] = useState(1);
  const [emailInformado, setEmailInformado] = useState('');
  const [tokenValidado, setTokenValidado] = useState('');

  // Passo 1 finalizado: Guarda o e-mail e vai para a verificação do código
  const avancarParaCodigo = (email) => {
    setEmailInformado(email);
    setEtapa(2);
  };

  // Passo 2 finalizado: Guarda o token de autorização da API e vai para a nova senha
  const avancarParaNovaSenha = (token) => {
    setTokenValidado(token);
    setEtapa(3);
  };

  return (
    <div className={styles.containerLogin}>
      <Header titulo="Recuperação de Conta" />

      <div className={styles.cardLogin} style={{ maxWidth: '420px', margin: '40px auto' }}>

        {etapa === 1 && (
          <RecuperarSenhaForm
            onEmailEnviado={avancarParaCodigo}
            onVoltarLogin={() => navigate('/login')}
          />
        )}

        {etapa === 2 && (
          <ValidarCodigoForm
            email={emailInformado}
            onCodigoValido={avancarParaNovaSenha}
            onVoltar={() => setEtapa(1)}
          />
        )}

        {etapa === 3 && (
          <DefinirNovaSenhaForm
            tokenTemporario={tokenValidado}
            onSucesso={() => {
              alert('Senha alterada com sucesso! Faça login com a nova senha.');
              navigate('/login');
            }}
          />
        )}

      </div>
    </div>
  );
};