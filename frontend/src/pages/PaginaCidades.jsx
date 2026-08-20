import { useEffect, useState } from 'react';
import { api } from '../api';
import { IconeEditar, IconeExcluir } from '../components/Icones';
import { ESTADOS_BR } from '../constants';
import { useNotificacao } from '../components/Notificacoes';
import { useConfirm } from '../components/ConfirmDialog';
import Combobox from '../components/Combobox';

const VAZIO = { nome: '', estado: '' };

export default function PaginaCidades() {
  const notificar = useNotificacao();
  const confirmar = useConfirm();
  const [cidades, setCidades] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cidadeEditando, setCidadeEditando] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [formInicial, setFormInicial] = useState(VAZIO);

  async function carregar() {
    try {
      const dados = await api.listarCidades();
      setCidades(dados);
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

  function handleEstadoChange(estado) {
    setForm((prev) => ({ ...prev, estado }));
  }

  function abrirNova() {
    setCidadeEditando(null);
    setForm(VAZIO);
    setFormInicial(VAZIO);
    setMostrarForm(true);
  }

  function abrirEditar(cidade) {
    setCidadeEditando(cidade);
    const valores = { nome: cidade.nome, estado: cidade.estado };
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
    setCidadeEditando(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (cidadeEditando) {
        await api.atualizarCidade(cidadeEditando.id, form);
        notificar('sucesso', 'Cidade atualizada com sucesso!');
      } else {
        await api.criarCidade(form);
        notificar('sucesso', 'Cidade cadastrada com sucesso!');
      }
      setForm(VAZIO);
      setMostrarForm(false);
      setCidadeEditando(null);
      await carregar();
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  async function handleExcluir(cidade) {
    const ok = await confirmar(`Excluir ${cidade.nome}/${cidade.estado}?`, {
      textoConfirmar: 'Excluir',
      perigo: true,
    });
    if (!ok) return;
    try {
      await api.excluirCidade(cidade.id);
      notificar('sucesso', 'Cidade excluída com sucesso!');
      await carregar();
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Cidades</h2>
        {!mostrarForm && (
          <button className="btn-primario" onClick={abrirNova}>
            + Nova cidade
          </button>
        )}
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>{cidadeEditando ? 'Editar cidade' : 'Nova cidade'}</h2>
          <label>
            Nome *
            <input name="nome" value={form.nome} onChange={handleChange} maxLength={100} required />
          </label>
          <label>
            Estado (UF) *
            <Combobox
              options={ESTADOS_BR.map((uf) => ({ value: uf.sigla, label: uf.sigla }))}
              value={form.estado}
              onChange={handleEstadoChange}
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
          {cidades.length === 0 && (
            <div className="empty-state">
              <span className="empty-emoji">📍</span>
              Nenhuma cidade cadastrada ainda.
            </div>
          )}

          {cidades.length > 0 && (
            <div className="tabela-wrap">
              <table className="tabela-animais">
                <colgroup>
                  <col />
                  <col style={{ width: '140px' }} />
                  <col style={{ width: '120px' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th className="centro">Estado</th>
                    <th className="centro">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {cidades.map((c) => (
                    <tr key={c.id}>
                      <td>{c.nome}</td>
                      <td className="centro">{c.estado}</td>
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
