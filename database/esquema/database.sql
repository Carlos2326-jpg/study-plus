CREATE DATABASE IF NOT EXISTS studyplus;
USE studyplus;

CREATE TABLE IF NOT EXISTS Usuario (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  foto_perfil VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  codigo_recuperacao VARCHAR(255),
  codigo_expira_em DATETIME,
  codigo_tentativas INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Disciplina (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255),
  cor VARCHAR(20),
  periodo_inicio DATE,
  periodo_fim DATE,
  progresso DECIMAL(5,2),
  status VARCHAR(20)
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
  descricao TEXT,
  estado VARCHAR(30) GENERATED ALWAYS AS (status) VIRTUAL,
  FOREIGN KEY (disciplina_id) REFERENCES Disciplina(id)
);

CREATE TABLE IF NOT EXISTS Subtarefa (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  tarefa_id INTEGER NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  concluida BOOLEAN DEFAULT FALSE,
  descricao TEXT,
  peso DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  estado VARCHAR(20) GENERATED ALWAYS AS (
    IF(concluida = 1, 'concluida', 'pendente')
  ) VIRTUAL,
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
  serie_id VARCHAR(36),
  tipo VARCHAR(20) NOT NULL DEFAULT 'estudo',
  descricao VARCHAR(255),
  FOREIGN KEY (disciplina_id) REFERENCES Disciplina(id),
  FOREIGN KEY (tarefa_id) REFERENCES Tarefa(id)
);

CREATE TABLE IF NOT EXISTS SessaoEstudo (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  tarefa_id INTEGER,
  disciplina VARCHAR(100) NOT NULL,
  tecnica_usada VARCHAR(30),
  inicio TIMESTAMP NULL,
  fim TIMESTAMP NULL,
  duracao_minutos INTEGER,
  anotacao TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'encerrada',
  acumulado_segundos INTEGER NOT NULL DEFAULT 0,
  retomado_em DATETIME,
  ultimo_ping DATETIME,
  pausas INTEGER NOT NULL DEFAULT 0,
  foco_min INTEGER,
  pausa_min INTEGER,
  blocos_planejados INTEGER,
  blocos_concluidos INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (usuario_id) REFERENCES Usuario(id)
);

CREATE TABLE IF NOT EXISTS Meta (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  disciplina VARCHAR(100) NOT NULL,
  carga_horaria_alvo DECIMAL(5,1) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  horas_cumpridas DECIMAL(5,1) DEFAULT 0.0,
  FOREIGN KEY (usuario_id) REFERENCES Usuario(id)
);