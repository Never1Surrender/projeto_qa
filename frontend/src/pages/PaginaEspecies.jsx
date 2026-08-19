import { useEffect, useState } from 'react';
import { api } from '../api';
import { IconeEditar, IconeExcluir } from '../components/Icones';
import { useNotificacao } from '../components/Notificacoes';
import { useConfirm } from '../components/ConfirmDialog';

const VAZIO = { nome: '' };

export default function PaginaEspecies() {
  const notificar = useNotificacao();
  const confirmar = useConfirm();
  const [especies, setEspecies] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [especieEditando, setEspecieEditando] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [formInicial, setFormInicial] = useState(VAZIO);

  async function carregar() {
    try {
      const dados = await api.listarEspecies();
      setEspecies(dados);
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function abrirNova() {
    setEspecieEditando(null);
    setForm(VAZIO);
    setFormInicial(VAZIO);
    setMostrarForm(true);
  }

  function abrirEditar(especie) {
    setEspecieEditando(especie);
    const valores = { nome: especie.nome };
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
    setEspecieEditando(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (especieEditando) {
        await api.atualizarEspecie(especieEditando.id, form);
        notificar('sucesso', 'Espécie atualizada com sucesso!');
      } else {
        await api.criarEspecie(form);
        notificar('sucesso', 'Espécie cadastrada com sucesso!');
      }
      setForm(VAZIO);
      setMostrarForm(false);
      setEspecieEditando(null);
      await carregar();
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  async function handleExcluir(especie) {
    const ok = await confirmar(`Excluir ${especie.nome}?`, { textoConfirmar: 'Excluir', perigo: true });
    if (!ok) return;
    try {
      await api.excluirEspecie(especie.id);
      notificar('sucesso', 'Espécie excluída com sucesso!');
      await carregar();
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Espécies</h2>
        {!mostrarForm && (
          <button className="btn-primario" onClick={abrirNova}>
            + Nova espécie
          </button>
        )}
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>{especieEditando ? 'Editar espécie' : 'Nova espécie'}</h2>
          <label>
            Nome *
            <input name="nome" value={form.nome} onChange={handleChange} maxLength={50} required />
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
          {especies.length === 0 && (
            <div className="empty-state">
              <span className="empty-emoji">🏷️</span>
              Nenhuma espécie cadastrada ainda.
            </div>
          )}

          {especies.length > 0 && (
            <table className="tabela-animais">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {especies.map((e) => (
                  <tr key={e.id}>
                    <td>{e.nome}</td>
                    <td className="acoes">
                      <button
                        className="btn-icone"
                        title="Editar"
                        aria-label={`Editar ${e.nome}`}
                        onClick={() => abrirEditar(e)}
                      >
                        <IconeEditar />
                      </button>
                      <button
                        className="btn-icone btn-perigo"
                        title="Excluir"
                        aria-label={`Excluir ${e.nome}`}
                        onClick={() => handleExcluir(e)}
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
