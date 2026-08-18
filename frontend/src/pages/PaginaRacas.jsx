import { useEffect, useState } from 'react';
import { api } from '../api';
import { IconeEditar, IconeExcluir } from '../components/Icones';

const VAZIO = { nome: '', especie_id: '' };

export default function PaginaRacas() {
  const [racas, setRacas] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [racaEditando, setRacaEditando] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      setErro('');
      const dados = await api.listarRacas();
      setRacas(dados);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function carregarEspecies() {
    try {
      const dados = await api.listarEspecies();
      setEspecies(dados);
    } catch (e) {
      setErro(e.message);
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

  function abrirNova() {
    setRacaEditando(null);
    setForm(VAZIO);
    setMostrarForm(true);
  }

  function abrirEditar(raca) {
    setRacaEditando(raca);
    setForm({ nome: raca.nome, especie_id: raca.especie_id });
    setMostrarForm(true);
  }

  function cancelar() {
    setMostrarForm(false);
    setRacaEditando(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setErro('');
      if (racaEditando) {
        await api.atualizarRaca(racaEditando.id, form);
      } else {
        await api.criarRaca(form);
      }
      setForm(VAZIO);
      setMostrarForm(false);
      setRacaEditando(null);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function handleExcluir(raca) {
    if (!window.confirm(`Excluir ${raca.nome}?`)) return;
    try {
      setErro('');
      await api.excluirRaca(raca.id);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Raças</h2>
        <button className={mostrarForm ? '' : 'btn-primario'} onClick={mostrarForm ? cancelar : abrirNova}>
          {mostrarForm ? 'Cancelar' : '+ Nova raça'}
        </button>
      </div>

      {erro && <p className="erro">{erro}</p>}

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>{racaEditando ? 'Editar raça' : 'Nova raça'}</h2>
          <label>
            Nome *
            <input name="nome" value={form.nome} onChange={handleChange} required />
          </label>
          <label>
            Espécie *
            <select name="especie_id" value={form.especie_id} onChange={handleChange} required>
              <option value="" disabled>
                Selecione...
              </option>
              {especies.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
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
