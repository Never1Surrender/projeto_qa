import { useEffect, useState } from 'react';
import { api } from '../api';
import { IconeEditar, IconeExcluir } from '../components/Icones';
import { ESTADOS_BR } from '../constants';

const VAZIO = { nome: '', estado: '' };

export default function PaginaCidades() {
  const [cidades, setCidades] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cidadeEditando, setCidadeEditando] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      setErro('');
      const dados = await api.listarCidades();
      setCidades(dados);
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
    setCidadeEditando(null);
    setForm(VAZIO);
    setMostrarForm(true);
  }

  function abrirEditar(cidade) {
    setCidadeEditando(cidade);
    setForm({ nome: cidade.nome, estado: cidade.estado });
    setMostrarForm(true);
  }

  function cancelar() {
    setMostrarForm(false);
    setCidadeEditando(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setErro('');
      if (cidadeEditando) {
        await api.atualizarCidade(cidadeEditando.id, form);
      } else {
        await api.criarCidade(form);
      }
      setForm(VAZIO);
      setMostrarForm(false);
      setCidadeEditando(null);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function handleExcluir(cidade) {
    if (!window.confirm(`Excluir ${cidade.nome}/${cidade.estado}?`)) return;
    try {
      setErro('');
      await api.excluirCidade(cidade.id);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Cidades</h2>
        <button className={mostrarForm ? '' : 'btn-primario'} onClick={mostrarForm ? cancelar : abrirNova}>
          {mostrarForm ? 'Cancelar' : '+ Nova cidade'}
        </button>
      </div>

      {erro && <p className="erro">{erro}</p>}

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>{cidadeEditando ? 'Editar cidade' : 'Nova cidade'}</h2>
          <label>
            Nome *
            <input name="nome" value={form.nome} onChange={handleChange} maxLength={100} required />
          </label>
          <label>
            Estado (UF) *
            <select name="estado" value={form.estado} onChange={handleChange} required>
              <option value="" disabled>
                Selecione...
              </option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf.sigla} value={uf.sigla}>
                  {uf.sigla} - {uf.nome}
                </option>
              ))}
            </select>
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
          {cidades.length === 0 && (
            <div className="empty-state">
              <span className="empty-emoji">📍</span>
              Nenhuma cidade cadastrada ainda.
            </div>
          )}

          {cidades.length > 0 && (
            <table className="tabela-animais">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cidades.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nome}</td>
                    <td>{c.estado}</td>
                    <td className="acoes">
                      <button
                        className="btn-icone"
                        title="Editar"
                        aria-label={`Editar ${c.nome}`}
                        onClick={() => abrirEditar(c)}
                      >
                        <IconeEditar />
                      </button>
                      <button
                        className="btn-icone btn-perigo"
                        title="Excluir"
                        aria-label={`Excluir ${c.nome}`}
                        onClick={() => handleExcluir(c)}
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
