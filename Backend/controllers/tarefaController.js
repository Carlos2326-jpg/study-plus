const TarefaModel = require("../models/entidades/tarefaModel.js");
const SubtarefaModel = require("../models/entidades/subtarefaModel.js");

// TAREFAS
const listarTarefas = async (req, res) => {
  try {
    const usuario_id = req.params.usuario_id || 1;
    const tarefas = await TarefaModel.listar(usuario_id, req.query);
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar tarefas." });
  }
};

const buscarTarefa = async (req, res) => {
  try {
    const tarefa = await TarefaModel.buscarPorId(req.params.id);
    if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada." });
    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar tarefa." });
  }
};

const criarTarefa = async (req, res) => {
  try {
    if (!req.body.titulo) return res.status(400).json({ erro: "Título é obrigatório." });
    const tarefa = await TarefaModel.criar(req.body);
    res.status(201).json(tarefa);
  } catch (err) {
    console.error("ERRO criarTarefa:", err.message); // ← adiciona isso
    res.status(500).json({ erro: "Erro ao criar tarefa.", detalhe: err.message });
  }
};

const atualizarTarefa = async (req, res) => {
  try {
    const tarefa = await TarefaModel.atualizar(req.params.id, req.body);
    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar tarefa." });
  }
};

const excluirTarefa = async (req, res) => {
  try {
    await TarefaModel.excluir(req.params.id);
    res.json({ mensagem: "Tarefa excluída com sucesso." });
  } catch (err) {
    console.error("ERRO excluirTarefa:", err.message);
    res.status(500).json({ erro: "Erro ao excluir tarefa.", detalhe: err.message });
  }
};

// SUBTAREFAS
const listarSubtarefas = async (req, res) => {
  try {
    const subtarefas = await SubtarefaModel.listarPorTarefa(req.params.id);
    res.json(subtarefas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar subtarefas." });
  }
};

const criarSubtarefa = async (req, res) => {
  try {
    if (!req.body.titulo) return res.status(400).json({ erro: "Título é obrigatório." });
    const subtarefa = await SubtarefaModel.criar(req.params.id, req.body.titulo);
    res.status(201).json(subtarefa);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar subtarefa." });
  }
};

const atualizarSubtarefa = async (req, res) => {
  try {
    const subtarefa = await SubtarefaModel.atualizar(req.params.id, req.body);
    res.json(subtarefa);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar subtarefa." });
  }
};

const excluirSubtarefa = async (req, res) => {
  try {
    await SubtarefaModel.excluir(req.params.id);
    res.json({ mensagem: "Subtarefa excluída com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao excluir subtarefa." });
  }
};

module.exports = {
  listarTarefas, buscarTarefa, criarTarefa, atualizarTarefa, excluirTarefa,
  listarSubtarefas, criarSubtarefa, atualizarSubtarefa, excluirSubtarefa,
};