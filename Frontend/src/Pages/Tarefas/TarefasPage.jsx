import { useState, useEffect } from "react";
import TarefaList from "../../Components/Tarefas/TarefaList.jsx";
import TarefaForm from "../../Components/Forms/TarefaForm.jsx";
import { tarefaService, subtarefaService } from "../../Services/tarefaService.js";
import api from "../../Services/api.js";


const TarefasPage = () => {
  const [tarefas, setTarefas] = useState([]);
  const [subtarefas, setSubtarefas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [tarefasData, disciplinasData] = await Promise.all([
          tarefaService.listar({ usuario_id: 1 }),
          api.get("/disciplinas").then((r) => r.data),
        ]);

        setTarefas(tarefasData);
        setDisciplinas(disciplinasData);

        const todasSubtarefas = [];
        for (const tarefa of tarefasData) {
          const subs = await subtarefaService.listarPorTarefa(tarefa.id);
          todasSubtarefas.push(...subs);
        }
        setSubtarefas(todasSubtarefas);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, []);

  const handleNovaTarefa = () => { setTarefaEditando(null); setModalAberto(true); };
  const handleEditar = (tarefa) => { setTarefaEditando(tarefa); setModalAberto(true); };
  const handleCancelar = () => { setModalAberto(false); setTarefaEditando(null); };

  const handleSalvar = async (dados, subtarefasForm = []) => {
    try {
      if (tarefaEditando) {
        await tarefaService.atualizar(tarefaEditando.id, dados);
        setTarefas((prev) =>
          prev.map((t) => t.id === tarefaEditando.id ? { ...t, ...dados } : t)
        );
        const novasSubs = [];
        for (const s of subtarefasForm) {
          const novaSub = await subtarefaService.criar(tarefaEditando.id, s.titulo);
          novasSubs.push({ ...novaSub, tarefa_id: tarefaEditando.id });
        }
        if (novasSubs.length) setSubtarefas((prev) => [...prev, ...novasSubs]);
      } else {
        const novaTarefa = await tarefaService.criar({ ...dados, usuario_id: 1 });
        const tarefaProntaParaCard = {
          ...dados, ...novaTarefa,
          disciplina_id: novaTarefa.disciplina_id ?? dados.disciplina_id,
        };
        setTarefas((prev) => [...prev, tarefaProntaParaCard]);

        const novasSubtarefasSalvas = [];
        for (const s of subtarefasForm) {
          const novaSub = await subtarefaService.criar(novaTarefa.id, s.titulo);
          novasSubtarefasSalvas.push({ ...novaSub, tarefa_id: novaTarefa.id });
        }
        setSubtarefas((prev) => [...prev, ...novasSubtarefasSalvas]);
      }
    } catch (err) {
      console.error("Erro ao salvar tarefa:", err);
      alert("Erro ao salvar tarefa. Verifique se o servidor está rodando.");
    }
    setModalAberto(false);
    setTarefaEditando(null);
  };

  if (carregando)
    return <div className="loading-screen">Carregando tarefas... 🌱</div>;

  return (
    <div className="tarefas-page">
      <TarefaList
        tarefas={tarefas}
        disciplinas={disciplinas}
        subtarefasState={subtarefas}
        setSubtarefas={setSubtarefas}
        setTarefas={setTarefas}
        onEditar={handleEditar}
        onNovaTarefa={handleNovaTarefa}
      />
      {modalAberto && (
        <TarefaForm
          tarefaExistente={tarefaEditando}
          disciplinas={disciplinas}
          onSalvar={handleSalvar}
          onCancelar={handleCancelar}
        />
      )}
    </div>
  );
};

export default TarefasPage;