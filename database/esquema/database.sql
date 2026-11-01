CREATE DATABASE IF NOT EXISTS studyplus;
USE studyplus;

CREATE TABLE IF NOT EXISTS Disciplina (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Tarefa (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  disciplina_id INTEGER,
  titulo VARCHAR(255) NOT NULL,
  prioridade VARCHAR(20),
  status VARCHAR(30) DEFAULT 'pendente',
  prazo DATE,
  criado_em DATE,
  FOREIGN KEY (disciplina_id) REFERENCES Disciplina(id)
);

CREATE TABLE IF NOT EXISTS Subtarefa (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  tarefa_id INTEGER NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  concluida BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (tarefa_id) REFERENCES Tarefa(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Cronograma (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  disciplina_id INTEGER,
  tarefa_id INTEGER,
  data DATE NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,
  recorrencia VARCHAR(20) DEFAULT 'nenhuma',
  FOREIGN KEY (disciplina_id) REFERENCES Disciplina(id),
  FOREIGN KEY (tarefa_id) REFERENCES Tarefa(id)
);