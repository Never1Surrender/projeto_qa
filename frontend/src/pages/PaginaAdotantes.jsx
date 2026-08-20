import { useEffect, useState } from 'react';
import { api } from '../api';
import { IconeEditar, IconeExcluir } from '../components/Icones';
import { formatarCPF, formatarTelefone } from '../utils';
import { useNotificacao } from '../components/Notificacoes';
import { useConfirm } from '../components/ConfirmDialog';
import SeletorCidade from '../components/SeletorCidade';
import Paginacao from '../components/Paginacao';

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
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const [ordenar, setOrdenar] = useState('criado_em');
  const [direcao, setDirecao] = useState('desc');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  async function carregar() {
    try {
      const resultado = await api.listarAdotantes({ busca: buscaDebounced, ordenar, direcao, page: pagina });
      setAdotantes(resultado.dados);
      setTotal(resultado.total);
      setTotalPaginas(resultado.totalPaginas);
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
    const timer = setTimeout(() => setBuscaDebounced(busca), 400);
    return () => clearTimeout(timer);
  }, [busca]);

  useEffect(() => {
    setPagina(1);
  }, [buscaDebounced, ordenar, direcao]);

  useEffect(() => {
    carregar();
  }, [buscaDebounced, ordenar, direcao, pagina]);

  useEffect(() => {
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
      if (!adotanteEditando && pagina !== 1) {
        setPagina(1);
      } else {
        await carregar();
      }
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
          <div className="filtros">
            <label>
              Buscar por nome:
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Digite o nome do adotante..."
              />
            </label>
            <label>
              Ordenar por:
              <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)}>
                <option value="nome">Nome</option>
                <option value="criado_em">Data de cadastro</option>
              </select>
            </label>
            <label>
              Direção:
              <select value={direcao} onChange={(e) => setDirecao(e.target.value)}>
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </select>
            </label>
          </div>

          {adotantes.length === 0 && (
            <div className="empty-state">
              <span className="empty-emoji">🧑‍🤝‍🧑</span>
              {busca ? `Nenhum adotante encontrado para "${busca}".` : 'Nenhum adotante cadastrado ainda.'}
            </div>
          )}

          {adotantes.length > 0 && (
            <div className="tabela-wrap">
              <table className="tabela-animais tabela-adotantes">
                <colgroup>
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '15%' }} />
                </colgroup>
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
                      <td className="truncate" title={a.nome}>{a.nome}</td>
                      <td className="whitespace-nowrap">{formatarCPF(a.cpf)}</td>
                      <td className="whitespace-nowrap">{a.telefone ? formatarTelefone(a.telefone) : '-'}</td>
                      <td className="truncate" title={a.email || ''}>{a.email || '-'}</td>
                      <td className="truncate">{a.cidade_nome ? `${a.cidade_nome}/${a.cidade_estado}` : '-'}</td>
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
            </div>
          )}

          <Paginacao pagina={pagina} totalPaginas={totalPaginas} total={total} onMudarPagina={setPagina} />
        </>
      )}
    </div>
  );
}
