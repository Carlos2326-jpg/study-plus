# 🌱 Study+ 

O **Study+** é um sistema web completo de produtividade e gestão de estudos. Ele foi projetado para ajudar estudantes a organizarem suas tarefas, acompanharem o tempo de foco (Pomodoro) e visualizarem seu progresso de forma intuitiva e motivadora.

O projeto é dividido em uma API RESTful robusta (Back-end), um banco de dados relacional e uma interface moderna, responsiva e com suporte a Dark Mode (Front-end).

---

## 📸 Preview do Sistema

> 💡 *Dica: Adicione aqui imagens das telas mais bonitas do projeto para causar uma ótima primeira impressão.*

| Tela de Login | Dashboard / Estudos |
| :---: | :---: |
| ![Tela de Login](LINK_DA_IMAGEM_AQUI) | ![Dashboard](LINK_DA_IMAGEM_AQUI) |

| Tarefas (Dark Mode) | Relatório em PDF |
| :---: | :---: |
| ![Tarefas Dark](LINK_DA_IMAGEM_AQUI) | ![PDF](LINK_DA_IMAGEM_AQUI) |

---

## 🚀 Funcionalidades

- **Autenticação Completa:** Login, Cadastro e Recuperação de Senha (via código por e-mail).
- **Gestão de Tarefas e Estudos:** Criação de tarefas com subtarefas, prazos e prioridades.
- **Listas e Categorias:** Organização de tarefas por disciplinas.
- **Calendário Interativo:** Visualização de cronogramas e prazos.
- **Temporizador (Pomodoro):** Cronômetro customizável com registro de tempo real no banco.
- **Dashboard de Progresso:** Gráficos de horas estudadas e tarefas concluídas.
- **Exportação de Relatórios:** Geração de relatórios em PDF com resumo de produtividade.
- **Perfil do Usuário:** Edição de nome, foto e alternância entre **Modo Claro e Escuro**.
- **Design Responsivo:** Sidebar (Desktop) e Bottom Navigation (Mobile).

---

## 🛠️ Tecnologias Utilizadas

### Front-end
- **React** + **Vite**
- **React Router DOM** (Navegação)
- **Axios** (Consumo de API)
- **React PDF Renderer** (Geração de relatórios)
- **Lucide React** (Ícones)
- **CSS Puro** (Variáveis CSS e Design System)

### Back-end
- **Node.js** + **Express**
- **MySQL** (Banco de dados relacional)
- **JWT** (Autenticação via Token)
- **Bcrypt** (Criptografia de senhas)
- **Nodemailer** (Disparo de e-mails)

---

## 📂 Arquitetura do Projeto

O projeto adota uma separação clara de responsabilidades (Client-Server-Database). Abaixo está a estrutura de pastas completa.

### Back-end (/Backend)
```text
Backend/
├── acesso_dados/        # Conexão com o MySQL (Pool) e Queries
├── controllers/         # Recebem as requisições HTTP
├── middlewares/         # Autenticação JWT, validações e logs
├── models/
│   ├── entidades/       # Representação das tabelas
│   └── regras_negocio/  # Services (lógica de negócio)
├── routes/              # Definição das rotas da API (Express)
├── seguranca/           # Geração de hash e tokens JWT
├── .env.example         # Modelo de variáveis de ambiente
├── index.js             # Ponto de entrada da aplicação
└── package.json
```

### Banco de Dados (`/database`)
```text
database/
├── esquema/       # Scripts de criação das tabelas (DDL)
└── persistencia/  # Dados iniciais (Seed) ou dumps
```

###  Front-end (/Frontend)
```text
Frontend/
├── public/
├── src/
│   ├── Assets/
│   │   ├── images/          # Ícones, logos e ilustrações
│   │   └── Styles/          # CSS global e variáveis (Design System)
│   ├── Components/          # Componentes reutilizáveis
│   │   ├── layout/          # AppLayout (Sidebar + BottomNav)
│   │   ├── Modals/          # Modais de Tarefa e Disciplina
│   │   ├── Relatorio/       # Componente gerador do PDF
│   │   └── ui/              # Inputs e Botões genéricos
│   ├── Controllers/         # Context API (Auth)
│   ├── Pages/               # Telas do sistema
│   │   ├── Auth/            # Login, Cadastro, Recuperação
│   │   ├── Tarefas/         # Listagem de tarefas
│   │   ├── Estudos/         # Listagem de cronogramas
│   │   ├── Listas/          # Agrupamento por disciplina
│   │   ├── Calendario/      # Visão de calendário
│   │   ├── Timer/           # Temporizador Pomodoro
│   │   ├── Progresso/       # Gráficos e estatísticas
│   │   └── Perfil/          # Configurações do usuário
│   ├── Services/            # Configuração do Axios e chamadas HTTP
│   ├── Utils/               # Formatadores e validadores
│   ├── app.jsx
│   ├── main.jsx
│   └── routes.jsx           # Gerenciamento de rotas
├── .gitignore
├── package.json
└── README.md
```
---

## Como Rodar o Projeto  

### Pré-requisitos
- Node.js (v16+)
- MySQL (ou XAMPP/WAMP)
- Git

### 1. Clonando o repositório
```text
git clone https://github.com/seu-usuario/study-plus.git
cd study-plus
```

### 2. Configurando o Banco de Dados
1. Abra o MySQL (ou phpMyAdmin).
2. Crie um banco chamado studyplus.
3.   Importe o script SQL que está na pasta /database/esquema/ para criar as tabelas.

### 3. Configurando o Back-end
```text
cd Backend
npm install
```

####Copie o arquivo .env.example para .env e preencha com os dados do seu banco:
```text
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=studyplus
JWT_SECRET=sua_chave_secreta_aqui
```

#### Inicie o servidor:
```text
node indez.js
```

### 4. Configurando o Front-end
```text
cd Frontend
npm install
```

## Inicie o Vite:

```text
npm run dev
```  

---

## Design System
O sistema utiliza uma paleta baseada em tons de roxo e cinza, com suporte nativo a Dark Mode.
As variáveis CSS estão centralizadas no arquivo src/Assets/Styles/variaveis.css, permitindo fácil manutenção e consistência visual em todas as telas.

---

### 📄 Licença
Este projeto foi desenvolvido para fins acadêmicos e de estudo. Sinta-se livre para usar como base para outros projetos.
