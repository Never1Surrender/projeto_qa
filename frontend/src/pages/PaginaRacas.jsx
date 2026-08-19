import { useEffect, useState } from 'react';
import { api } from '../api';
import { IconeEditar, IconeExcluir } from '../components/Icones';
import { useNotificacao } from '../components/Notificacoes';
import { useConfirm } from '../components/ConfirmDialog';
import Combobox from '../components/Combobox';

const VAZIO = { nome: '', especie_id: '' };

export default function PaginaRacas() {
  const notificar = useNotificacao();
  const confirmar = useConfirm();
  const [racas, setRacas] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [racaEditando, setRacaEditando] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [formInicial, setFormInicial] = useState(VAZIO);

  async function carregar() {
    try {
      const dados = await api.listarRacas();
      setRacas(dados);
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  async function carregarEspecies() {
    try {
      const dados = await api.listarEspecies();
      setEspecies(dados);
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  useEffect(() => {
    carregar();
    carregarEspecies();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEspecieChange(especieId) {
    setForm((prev) => ({ ...prev, especie_id: especieId }));
  }

  function abrirNova() {
    setRacaEditando(null);
    setForm(VAZIO);
    setFormInicial(VAZIO);
    setMostrarForm(true);
  }

  function abrirEditar(raca) {
    setRacaEditando(raca);
    const valores = { nome: raca.nome, especie_id: raca.especie_id };
    setForm(valores);
    setFormInicial(valores);
    setMostrarForm(true);
  }

  async function cancelar() {
    const alterado = JSON.stringify(form) !== JSON.stringify(formInicial);
    if (alterado) {
      const ok = await confirmar('Você tem alterações não salvas. Deseja realmente cancelar?', {
        textoConfirmar: 'Descartar',
        perigo: true,
      });
      if (!ok) return;
    }
    setMostrarForm(false);
    setRacaEditando(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (racaEditando) {
        await api.atualizarRaca(racaEditando.id, form);
        notificar('sucesso', 'Raça atualizada com sucesso!');
      } else {
        await api.criarRaca(form);
        notificar('sucesso', 'Raça cadastrada com sucesso!');
      }
      setForm(VAZIO);
      setMostrarForm(false);
      setRacaEditando(null);
      await carregar();
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  async function handleExcluir(raca) {
    const ok = await confirmar(`Excluir ${raca.nome}?`, { textoConfirmar: 'Excluir', perigo: true });
    if (!ok) return;
    try {
      await api.excluirRaca(raca.id);
      notificar('sucesso', 'Raça excluída com sucesso!');
      await carregar();
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Raças</h2>
        {!mostrarForm && (
          <button className="btn-primario" onClick={abrirNova}>
            + Nova raça
          </button>
        )}
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>{racaEditando ? 'Editar raça' : 'Nova raça'}</h2>
          <label>
            Nome *
            <input name="nome" value={form.nome} onChange={handleChange} maxLength={100} required />
          </label>
          <label>
            Espécie *
            <Combobox
              options={especies.map((e) => ({ value: e.id, label: e.nome }))}
              value={form.especie_id}
              onChange={handleEspecieChange}
              placeholder="Digite ou selecione..."
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn-primario">
              Salvar
            </button>
            <button type="button" onClick={cancelar}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!mostrarForm && (
        <>
          {racas.length === 0 && (
            <div className="empty-state">
              <span className="empty-emoji">🧬</span>
              Nenhuma raça cadastrada ainda.
            </div>
          )}

          {racas.length > 0 && (
            <table className="tabela-animais">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Espécie</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {racas.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nome}</td>
                    <td>{r.especie_nome}</td>
                    <td className="acoes">
                      <button
                        className="btn-icone"
                        title="Editar"
                        aria-label={`Editar ${r.nome}`}
                        onClick={() => abrirEditar(r)}
                      >
                        <IconeEditar />
                      </button>
                      <button
                        className="btn-icone btn-perigo"
                        title="Excluir"
                        aria-label={`Excluir ${r.nome}`}
                        onClick={() => handleExcluir(r)}
                      >
                        <IconeExcluir />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
