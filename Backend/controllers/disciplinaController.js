const DisciplinaModel = require("../models/entidades/disciplinaModel.js");

const falha = (res, msg, err) => {
  console.error(msg, err.message);
  res.status(500).json({ message: msg, erro: err.message });
};

const listarDisciplinas = async (req, res) => {
  try { res.json(await DisciplinaModel.listar(req.usuarioId)); }
  catch (err) { falha(res, "Erro ao listar disciplinas.", err); }
};

const buscarDisciplina = async (req, res) => {
  try {
    const d = await DisciplinaModel.buscarPorId(req.params.id, req.usuarioId);
    if (!d) return res.status(404).json({ message: "Disciplina não encontrada." });
    res.json(d);
  } catch (err) { falha(res, "Erro ao buscar disciplina.", err); }
};

const criarDisciplina = async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const d = await DisciplinaModel.criar({ usuario_id: req.usuarioId, nome, descricao });
    res.status(201).json(d);
  } catch (err) { falha(res, "Erro ao criar disciplina.", err); }
};

const atualizarDisciplina = async (req, res) => {
  try {
    const existente = await DisciplinaModel.buscarPorId(req.params.id, req.usuarioId);
    if (!existente) return res.status(404).json({ message: "Disciplina não encontrada." });
    res.json(await DisciplinaModel.atualizar(req.params.id, req.usuarioId, req.body));
  } catch (err) { falha(res, "Erro ao atualizar disciplina.", err); }
};

const excluirDisciplina = async (req, res) => {
  try {
    const existente = await DisciplinaModel.buscarPorId(req.params.id, req.usuarioId);
    if (!existente) return res.status(404).json({ message: "Disciplina não encontrada." });
    if ((await DisciplinaModel.contarVinculos(req.params.id)) > 0) {
      return res.status(409).json({
        message: "Esta disciplina possui tarefas ou cronogramas vinculados e não pode ser excluída.",
      });
    }
    await DisciplinaModel.excluir(req.params.id, req.usuarioId);
    res.json({ message: "Disciplina excluída com sucesso." });
  } catch (err) { falha(res, "Erro ao excluir disciplina.", err); }
};

module.exports = {
  listarDisciplinas, buscarDisciplina, criarDisciplina, atualizarDisciplina, excluirDisciplina,
};