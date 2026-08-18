import { useEffect, useState } from 'react';
import { api } from '../api';
import { IconeEditar, IconeExcluir } from '../components/Icones';

const VAZIO = { nome: '' };

export default function PaginaEspecies() {
  const [especies, setEspecies] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [especieEditando, setEspecieEditando] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      setErro('');
      const dados = await api.listarEspecies();
      setEspecies(dados);
    } catch (e) {
      setErro(e.message);
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
    setMostrarForm(true);
  }

  function abrirEditar(especie) {
    setEspecieEditando(especie);
    setForm({ nome: especie.nome });
    setMostrarForm(true);
  }

  function cancelar() {
    setMostrarForm(false);
    setEspecieEditando(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setErro('');
      if (especieEditando) {
        await api.atualizarEspecie(especieEditando.id, form);
      } else {
        await api.criarEspecie(form);
      }
      setForm(VAZIO);
      setMostrarForm(false);
      setEspecieEditando(null);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function handleExcluir(especie) {
    if (!window.confirm(`Excluir ${especie.nome}?`)) return;
    try {
      setErro('');
      await api.excluirEspecie(especie.id);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Espécies</h2>
        <button className={mostrarForm ? '' : 'btn-primario'} onClick={mostrarForm ? cancelar : abrirNova}>
          {mostrarForm ? 'Cancelar' : '+ Nova espécie'}
        </button>
      </div>

      {erro && <p className="erro">{erro}</p>}

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
