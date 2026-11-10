# 🌱 Study+ 

O **Study+** é um sistema web de produtividade e gestão de estudos. Ele foi projetado para ajudar estudantes a organizarem suas tarefas, acompanharem o tempo de foco (Pomodoro) e visualizarem seu progresso de forma intuitiva e motivadora.

O projeto é dividido em uma API RESTful (Back-end) e uma interface moderna e responsiva (Front-end).

---

## 🚀 Funcionalidades

- **Autenticação Completa:** Login, Cadastro e Recuperação de Senha (via código por e-mail).
- **Gestão de Tarefas e Estudos:** Criação de tarefas com subtarefas, prazos e prioridades. Estudos agendados em um calendário.
- **Listas e Categorias:** Organização de tarefas por disciplinas.
- **Calendário Interativo:** Visualização de cronogramas e prazos de tarefas.
- **Temporizador (Pomodoro):** Cronômetro customizável com contagem de blocos e registro de tempo de estudo no banco.
- **Dashboard de Progresso:** Gráficos (semana, mês, ano) de horas estudadas e tarefas concluídas.
- **Exportação de Relatórios:** Geração de relatórios em PDF com resumo de produtividade.
- **Perfil do Usuário:** Edição de nome, foto de perfil e alternância entre **Modo Claro e Escuro**.
- **Design Responsivo:** Interface adaptada para Mobile, Tablet e Desktop (Sidebar no desktop, BottomNav no mobile).

---

## 🛠️ Tecnologias Utilizadas

### Front-end
- **[React](https://reactjs.org/)**: Biblioteca para construção da interface.
- **[Vite](https://vitejs.dev/)**: Build tool e servidor de desenvolvimento.
- **[React Router DOM](https://reactrouter.com/)**: Gerenciamento de rotas.
- **[Axios](https://axios-http.com/)**: Cliente HTTP para consumo da API.
- **[React PDF Renderer](https://react-pdf.org/)**: Geração de relatórios em PDF.
- **[Lucide React](https://lucide.dev/)**: Ícones modernos.
- **CSS Puro**: Estilização com variáveis (Design System) e Dark Mode.

### Back-end
- **[Node.js](https://nodejs.org/)** e **[Express](https://expressjs.com/)**: Servidor e rotas da API.
- **[MySQL](https://www.mysql.com/)**: Banco de dados relacional.
- **[JWT](https://jwt.io/)**: Autenticação baseada em tokens.
- **[Bcrypt](https://github.com/kelektiv/node.bcrypt.js)**: Criptografia de senhas.
- **[Nodemailer](https://nodemailer.com/)**: Envio de e-mails para recuperação de senha e notificações.

---

## ⚙️ Como Rodar o Projeto

### Pré-requisitos
- Node.js (v16+)
- MySQL (ou XAMPP/WAMP para rodar localmente)
- Git

### 1. Clonando o repositório
```bash
git clone https://github.com/seu-usuario/study-plus.git
cd study-plus
