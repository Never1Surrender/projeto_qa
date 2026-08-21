'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { IconeEditar, IconeExcluir } from '@/components/icones';
import { useNotificacao } from '@/components/notificacoes';
import { useConfirm } from '@/components/confirm-dialog';
import type { Cidade } from '@/types';

export default function PaginaCidades() {
  const router = useRouter();
  const notificar = useNotificacao();
  const confirmar = useConfirm();
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [busca, setBusca] = useState('');

  async function carregar() {
    try {
      const dados = await api.listarCidades();
      setCidades(dados);
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleExcluir(cidade: Cidade) {
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
      notificar('erro', (e as Error).message);
    }
  }

  const cidadesFiltradas = cidades.filter((c) =>
    `${c.nome} ${c.estado}`.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h2>Cidades</h2>
      </div>

      <div className="filtros">
        <label>
          Buscar por nome ou estado:
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite o nome da cidade ou UF..."
          />
        </label>

        <button type="button" className="btn-primario ml-auto" onClick={() => router.push('/cidades/novo')}>
          + Nova cidade
        </button>
      </div>

      {cidades.length === 0 && (
        <div className="empty-state">
          <span className="empty-emoji">📍</span>
          Nenhuma cidade cadastrada ainda.
        </div>
      )}

      {cidades.length > 0 && cidadesFiltradas.length === 0 && (
        <div className="empty-state">
          <span className="empty-emoji">📍</span>
          Nenhuma cidade encontrada para &quot;{busca}&quot;.
        </div>
      )}

      {cidadesFiltradas.length > 0 && (
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
              {cidadesFiltradas.map((c) => (
                <tr key={c.id}>
                  <td>{c.nome}</td>
                  <td className="centro">{c.estado}</td>
                  <td className="acoes">
                    <button
                      className="btn-icone"
                      title="Editar"
                      aria-label={`Editar ${c.nome}`}
                      onClick={() => router.push(`/cidades/${c.id}/editar`)}
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
    </div>
  );
}
