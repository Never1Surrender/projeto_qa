'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { IconeEditar, IconeExcluir } from '@/components/icones';
import { formatarCPF, formatarTelefone } from '@/lib/utils';
import { useNotificacao } from '@/components/notificacoes';
import { useConfirm } from '@/components/confirm-dialog';
import Paginacao from '@/components/paginacao';
import type { Adotante } from '@/types';

export default function PaginaAdotantes() {
  const router = useRouter();
  const notificar = useNotificacao();
  const confirmar = useConfirm();
  const [adotantes, setAdotantes] = useState<Adotante[]>([]);
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
      notificar('erro', (e as Error).message);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscaDebounced, ordenar, direcao, pagina]);

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

  return (
    <div>
      <div className="page-header">
        <h2>Adotantes</h2>
        <button className="btn-primario" onClick={() => router.push('/adotantes/novo')}>
          + Novo adotante
        </button>
      </div>

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
