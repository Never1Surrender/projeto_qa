import { useEffect, useState } from 'react';
import { api } from '../api';
import { IconeEditar, IconeExcluir } from '../components/Icones';
import { formatarCPF, formatarTelefone } from '../utils';
import { useNotificacao } from '../components/Notificacoes';
import { useConfirm } from '../components/ConfirmDialog';
import SeletorCidade from '../components/SeletorCidade';

const VAZIO = { nome: '', cpf: '', telefone: '', email: '', cidade_id: '' };

export default function PaginaAdotantes() {
  const notificar = useNotificacao();
  const confirmar = useConfirm();
  const [adotantes, setAdotantes] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [adotanteEditando, setAdotanteEditando] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [formInicial, setFormInicial] = useState(VAZIO);

  async function carregar() {
    try {
      const dados = await api.listarAdotantes();
      setAdotantes(dados);
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  async function carregarCidades() {
    try {
      const dados = await api.listarCidades();
      setCidades(dados);
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  useEffect(() => {
    carregar();
    carregarCidades();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setForm((prev) => ({ ...prev, cpf: formatarCPF(value) }));
      return;
    }
    if (name === 'telefone') {
      setForm((prev) => ({ ...prev, telefone: formatarTelefone(value) }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCidadeChange(cidadeId) {
    setForm((prev) => ({ ...prev, cidade_id: cidadeId }));
  }

  function abrirNovo() {
    setAdotanteEditando(null);
    setForm(VAZIO);
    setFormInicial(VAZIO);
    setMostrarForm(true);
  }

  function abrirEditar(adotante) {
    setAdotanteEditando(adotante);
    const valores = {
      nome: adotante.nome,
      cpf: formatarCPF(adotante.cpf || ''),
      telefone: adotante.telefone ? formatarTelefone(adotante.telefone) : '',
      email: adotante.email || '',
      cidade_id: adotante.cidade_id || '',
    };
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
    setAdotanteEditando(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const dados = {
        nome: form.nome,
        cpf: form.cpf,
        telefone: form.telefone || null,
        email: form.email || null,
        cidade_id: form.cidade_id || null,
      };
      if (adotanteEditando) {
        await api.atualizarAdotante(adotanteEditando.id, dados);
        notificar('sucesso', 'Adotante atualizado com sucesso!');
      } else {
        await api.criarAdotante(dados);
        notificar('sucesso', 'Adotante cadastrado com sucesso!');
      }
      setForm(VAZIO);
      setMostrarForm(false);
      setAdotanteEditando(null);
      await carregar();
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  async function handleExcluir(adotante) {
    const ok = await confirmar(`Excluir ${adotante.nome}?`, { textoConfirmar: 'Excluir', perigo: true });
    if (!ok) return;
    try {
      await api.excluirAdotante(adotante.id);
      notificar('sucesso', 'Adotante excluído com sucesso!');
      await carregar();
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Adotantes</h2>
        {!mostrarForm && (
          <button className="btn-primario" onClick={abrirNovo}>
            + Novo adotante
          </button>
        )}
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>{adotanteEditando ? 'Editar adotante' : 'Novo adotante'}</h2>
          <label>
            Nome *
            <input name="nome" value={form.nome} onChange={handleChange} maxLength={150} required />
          </label>
          <label>
            CPF *
            <input
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
          </label>
          <label>
            Telefone
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </label>
          <label>
            E-mail
            <input name="email" type="email" value={form.email} onChange={handleChange} maxLength={150} />
          </label>
          <SeletorCidade cidades={cidades} value={form.cidade_id} onChange={handleCidadeChange} />
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
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Cidade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {adotantes.map((a) => (
                  <tr key={a.id}>
                    <td>{a.nome}</td>
                    <td>{formatarCPF(a.cpf)}</td>
                    <td>{a.telefone ? formatarTelefone(a.telefone) : '-'}</td>
                    <td>{a.email || '-'}</td>
                    <td>{a.cidade_nome ? `${a.cidade_nome}/${a.cidade_estado}` : '-'}</td>
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
