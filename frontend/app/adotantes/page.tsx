'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { IconeEditar, IconeExcluir, IconeFiltro } from '@/components/icones';
import Combobox from '@/components/combobox';
import { formatarCPF, formatarTelefone } from '@/lib/utils';
import { ESTADOS_BR } from '@/lib/constants';
import { useNotificacao } from '@/components/notificacoes';
import { useConfirm } from '@/components/confirm-dialog';
import Paginacao from '@/components/paginacao';
import type { Adotante, Cidade } from '@/types';

export default function PaginaAdotantes() {
  const router = useRouter();
  const notificar = useNotificacao();
  const confirmar = useConfirm();
  const [adotantes, setAdotantes] = useState<Adotante[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const [filtroCidade, setFiltroCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [ordenar, setOrdenar] = useState('criado_em');
  const [direcao, setDirecao] = useState('desc');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [sheetAberto, setSheetAberto] = useState(false);

  async function carregar() {
    try {
      const resultado = await api.listarAdotantes({
        busca: buscaDebounced,
        cidade_id: filtroCidade,
        ordenar,
        direcao,
        page: pagina,
      });
      setAdotantes(resultado.dados);
      setTotal(resultado.total);
      setTotalPaginas(resultado.totalPaginas);
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setBuscaDebounced(busca), 400);
    return () => clearTimeout(timer);
  }, [busca]);

  useEffect(() => {
    setPagina(1);
  }, [buscaDebounced, filtroCidade, ordenar, direcao]);

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscaDebounced, filtroCidade, ordenar, direcao, pagina]);

  useEffect(() => {
    api.listarCidades().then(setCidades).catch((e) => notificar('erro', (e as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEstadoChange(novoEstado: string | number) {
    setEstado(String(novoEstado));
    setFiltroCidade('');
  }

  async function handleExcluir(adotante: Adotante) {
    const ok = await confirmar(`Excluir ${adotante.nome}?`, { textoConfirmar: 'Excluir', perigo: true });
    if (!ok) return;
    try {
      await api.excluirAdotante(adotante.id);
      notificar('sucesso', 'Adotante excluído com sucesso!');
      await carregar();
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  function limparFiltros() {
    setBusca('');
    setFiltroCidade('');
    setEstado('');
  }

  const cidadeSelecionada = cidades.find((c) => String(c.id) === String(filtroCidade));
  const filtrosAtivos = [
    filtroCidade && {
      chave: 'cidade',
      rotulo: cidadeSelecionada ? `${cidadeSelecionada.nome}/${cidadeSelecionada.estado}` : '',
      limpar: () => setFiltroCidade(''),
    },
  ].filter(Boolean) as { chave: string; rotulo: string; limpar: () => void }[];

  return (
    <div>
      <div className="page-header">
        <h2>Adotantes</h2>
      </div>

      <div className="filtros mb-4">
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

        <div className="flex items-center gap-2 ml-auto">
          <button type="button" className="relative" onClick={() => setSheetAberto(true)}>
            <span className="inline-flex items-center gap-1.5">
              <IconeFiltro />
              Filtros
            </span>
            {filtrosAtivos.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[11px] font-extrabold align-middle">
                {filtrosAtivos.length}
              </span>
            )}
          </button>

          <button type="button" className="btn-primario" onClick={() => router.push('/adotantes/novo')}>
            + Novo adotante
          </button>
        </div>
      </div>

      {sheetAberto && (
        <>
          <div className="fixed inset-0 z-40 bg-ink/40" onClick={() => setSheetAberto(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-md p-6 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-xl text-ink">Filtros</h2>
              <button
                type="button"
                className="p-0 w-8 h-8 border-none bg-transparent text-ink-muted font-extrabold"
                onClick={() => setSheetAberto(false)}
                aria-label="Fechar filtros"
              >
                ✕
              </button>
            </div>

            <div className="filtros flex-col items-stretch border-none shadow-none p-0 mb-0 gap-4">
              <label>
                Filtrar por estado (UF):
                <Combobox
                  options={[
                    { value: '', label: 'Todos' },
                    ...ESTADOS_BR.map((uf) => ({ value: uf.sigla, label: uf.sigla })),
                  ]}
                  value={estado}
                  onChange={handleEstadoChange}
                  placeholder="Digite ou selecione..."
                />
              </label>

              <label>
                Filtrar por cidade:
                <Combobox
                  options={[
                    { value: '', label: 'Todas' },
                    ...cidades.filter((c) => !estado || c.estado === estado).map((c) => ({ value: c.id, label: c.nome })),
                  ]}
                  value={filtroCidade}
                  onChange={(v) => setFiltroCidade(String(v))}
                  placeholder={estado ? 'Digite ou selecione...' : 'Selecione um estado primeiro'}
                  disabled={!estado}
                />
              </label>
            </div>

            <div className="form-actions mt-2">
              <button type="button" className="btn-primario" onClick={() => setSheetAberto(false)}>
                Aplicar
              </button>
              <button type="button" onClick={limparFiltros}>
                Limpar filtros
              </button>
            </div>
          </div>
        </>
      )}

      {filtrosAtivos.length > 0 && (
        <div className="chips-filtro">
          {filtrosAtivos.map((filtro) => (
            <span className="chip" key={filtro.chave}>
              {filtro.rotulo}
              <button type="button" aria-label={`Remover filtro ${filtro.rotulo}`} onClick={filtro.limpar}>
                ×
              </button>
            </span>
          ))}
          <button type="button" className="chip-limpar" onClick={limparFiltros}>
            Limpar todos
          </button>
        </div>
      )}

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
                  <td className="truncate" title={a.nome}>
                    {a.nome}
                  </td>
                  <td className="whitespace-nowrap">{formatarCPF(a.cpf)}</td>
                  <td className="whitespace-nowrap">{a.telefone ? formatarTelefone(a.telefone) : '-'}</td>
                  <td className="truncate" title={a.email || ''}>
                    {a.email || '-'}
                  </td>
                  <td className="truncate">{a.cidade_nome ? `${a.cidade_nome}/${a.cidade_estado}` : '-'}</td>
                  <td className="acoes">
                    <button
                      className="btn-icone"
                      title="Editar"
                      aria-label={`Editar ${a.nome}`}
                      onClick={() => router.push(`/adotantes/${a.id}/editar`)}
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
    </div>
  );
}
