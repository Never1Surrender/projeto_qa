'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { IconeEditar, IconeExcluir } from '@/components/icones';
import { useNotificacao } from '@/components/notificacoes';
import { useConfirm } from '@/components/confirm-dialog';
import type { Especie } from '@/types';

export default function PaginaEspecies() {
  const router = useRouter();
  const notificar = useNotificacao();
  const confirmar = useConfirm();
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [busca, setBusca] = useState('');

  async function carregar() {
    try {
      const dados = await api.listarEspecies();
      setEspecies(dados);
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleExcluir(especie: Especie) {
    const ok = await confirmar(`Excluir ${especie.nome}?`, { textoConfirmar: 'Excluir', perigo: true });
    if (!ok) return;
    try {
      await api.excluirEspecie(especie.id);
      notificar('sucesso', 'Espécie excluída com sucesso!');
      await carregar();
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  const especiesFiltradas = especies.filter((e) => e.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <h2>Espécies</h2>
        <button className="btn-primario" onClick={() => router.push('/especies/novo')}>
          + Nova espécie
        </button>
      </div>

      <div className="filtros">
        <label>
          Buscar por nome:
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite o nome da espécie..."
          />
        </label>
      </div>

      {especies.length === 0 && (
        <div className="empty-state">
          <span className="empty-emoji">🏷️</span>
          Nenhuma espécie cadastrada ainda.
        </div>
      )}

      {especies.length > 0 && especiesFiltradas.length === 0 && (
        <div className="empty-state">
          <span className="empty-emoji">🏷️</span>
          Nenhuma espécie encontrada para &quot;{busca}&quot;.
        </div>
      )}

      {especiesFiltradas.length > 0 && (
        <div className="tabela-wrap">
          <table className="tabela-animais">
            <colgroup>
              <col />
              <col style={{ width: '120px' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Nome</th>
                <th className="centro">Ações</th>
              </tr>
            </thead>
            <tbody>
              {especiesFiltradas.map((e) => (
                <tr key={e.id}>
                  <td>{e.nome}</td>
                  <td className="acoes">
                    <button
                      className="btn-icone"
                      title="Editar"
                      aria-label={`Editar ${e.nome}`}
                      onClick={() => router.push(`/especies/${e.id}/editar`)}
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
        </div>
      )}
    </div>
  );
}
