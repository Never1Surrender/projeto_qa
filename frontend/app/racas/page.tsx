'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { IconeEditar, IconeExcluir } from '@/components/icones';
import { useNotificacao } from '@/components/notificacoes';
import { useConfirm } from '@/components/confirm-dialog';
import type { Raca } from '@/types';

export default function PaginaRacas() {
  const router = useRouter();
  const notificar = useNotificacao();
  const confirmar = useConfirm();
  const [racas, setRacas] = useState<Raca[]>([]);

  async function carregar() {
    try {
      const dados = await api.listarRacas();
      setRacas(dados);
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleExcluir(raca: Raca) {
    const ok = await confirmar(`Excluir ${raca.nome}?`, { textoConfirmar: 'Excluir', perigo: true });
    if (!ok) return;
    try {
      await api.excluirRaca(raca.id);
      notificar('sucesso', 'Raça excluída com sucesso!');
      await carregar();
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Raças</h2>
        <button className="btn-primario" onClick={() => router.push('/racas/novo')}>
          + Nova raça
        </button>
      </div>

      {racas.length === 0 && (
        <div className="empty-state">
          <span className="empty-emoji">🧬</span>
          Nenhuma raça cadastrada ainda.
        </div>
      )}

      {racas.length > 0 && (
        <div className="tabela-wrap">
          <table className="tabela-animais">
            <colgroup>
              <col />
              <col style={{ width: '200px' }} />
              <col style={{ width: '120px' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Espécie</th>
                <th className="centro">Ações</th>
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
                      onClick={() => router.push(`/racas/${r.id}/editar`)}
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
        </div>
      )}
    </div>
  );
}
