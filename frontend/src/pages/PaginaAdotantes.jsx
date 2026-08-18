import { useEffect, useState } from 'react';
import { api } from '../api';
import { IconeEditar, IconeExcluir } from '../components/Icones';

const VAZIO = { nome: '', contato: '', cidade_id: '' };

export default function PaginaAdotantes() {
  const [adotantes, setAdotantes] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [adotanteEditando, setAdotanteEditando] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      setErro('');
      const dados = await api.listarAdotantes();
      setAdotantes(dados);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function carregarCidades() {
    try {
      const dados = await api.listarCidades();
      setCidades(dados);
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregar();
    carregarCidades();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function abrirNovo() {
    setAdotanteEditando(null);
    setForm(VAZIO);
    setMostrarForm(true);
  }

  function abrirEditar(adotante) {
    setAdotanteEditando(adotante);
    setForm({
      nome: adotante.nome,
      contato: adotante.contato,
      cidade_id: adotante.cidade_id || '',
    });
    setMostrarForm(true);
  }

  function cancelar() {
    setMostrarForm(false);
    setAdotanteEditando(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setErro('');
      const dados = {
        nome: form.nome,
        contato: form.contato,
        cidade_id: form.cidade_id || null,
      };
      if (adotanteEditando) {
        await api.atualizarAdotante(adotanteEditando.id, dados);
      } else {
        await api.criarAdotante(dados);
      }
      setForm(VAZIO);
      setMostrarForm(false);
      setAdotanteEditando(null);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function handleExcluir(adotante) {
    if (!window.confirm(`Excluir ${adotante.nome}?`)) return;
    try {
      setErro('');
      await api.excluirAdotante(adotante.id);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Adotantes</h2>
        <button className={mostrarForm ? '' : 'btn-primario'} onClick={mostrarForm ? cancelar : abrirNovo}>
          {mostrarForm ? 'Cancelar' : '+ Novo adotante'}
        </button>
      </div>

      {erro && <p className="erro">{erro}</p>}

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>{adotanteEditando ? 'Editar adotante' : 'Novo adotante'}</h2>
          <label>
            Nome *
            <input name="nome" value={form.nome} onChange={handleChange} required />
          </label>
          <label>
            Contato *
            <input name="contato" value={form.contato} onChange={handleChange} required />
          </label>
          <label>
            Cidade
            <select name="cidade_id" value={form.cidade_id} onChange={handleChange}>
              <option value="">-- Não informado --</option>
              {cidades.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}/{c.estado}
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
          {adotantes.length === 0 && (
            <div className="empty-state">
              <span className="empty-emoji">🧑‍🤝‍🧑</span>
              Nenhum adotante cadastrado ainda.
            </div>
          )}

          {adotantes.length > 0 && (
            <table className="tabela-animais">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Cidade</th>
                  <th>Cadastrado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {adotantes.map((a) => (
                  <tr key={a.id}>
                    <td>{a.nome}</td>
                    <td>{a.contato}</td>
                    <td>{a.cidade_nome ? `${a.cidade_nome}/${a.cidade_estado}` : '-'}</td>
                    <td>{new Date(a.criado_em).toLocaleDateString('pt-BR')}</td>
                    <td className="acoes">
                      <button
                        className="btn-icone"
                        title="Editar"
                        aria-label={`Editar ${a.nome}`}
                        onClick={() => abrirEditar(a)}
                      >
                        <IconeEditar />
                      </button>
                      <button
                        className="btn-icone btn-perigo"
                        title="Excluir"
                        aria-label={`Excluir ${a.nome}`}
                        onClick={() => handleExcluir(a)}
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
