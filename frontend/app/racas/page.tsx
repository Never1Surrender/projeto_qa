'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { IconeEditar, IconeExcluir } from '@/components/icones';
import Combobox from '@/components/combobox';
import { useNotificacao } from '@/components/notificacoes';
import { useConfirm } from '@/components/confirm-dialog';
import type { Especie, Raca } from '@/types';

export default function PaginaRacas() {
  const router = useRouter();
  const notificar = useNotificacao();
  const confirmar = useConfirm();
  const [racas, setRacas] = useState<Raca[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState<string | number>('');

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
    api.listarEspecies().then(setEspecies).catch((e) => notificar('erro', (e as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const racasFiltradas = racas.filter((r) => {
    const bateNome = r.nome.toLowerCase().includes(busca.toLowerCase());
    const bateEspecie = !filtroEspecie || String(r.especie_id) === String(filtroEspecie);
    return bateNome && bateEspecie;
  });

  return (
    <div>
      <div className="page-header">
        <h2>Raças</h2>
        <button className="btn-primario" onClick={() => router.push('/racas/novo')}>
          + Nova raça
        </button>
      </div>

      <div className="filtros">
        <label>
          Buscar por nome:
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite o nome da raça..."
          />
        </label>
        <label>
          Filtrar por espécie:
          <Combobox
            options={[{ value: '', label: 'Todas' }, ...especies.map((e) => ({ value: e.id, label: e.nome }))]}
            value={filtroEspecie}
            onChange={setFiltroEspecie}
            placeholder="Digite ou selecione..."
          />
        </label>
      </div>

      {racas.length === 0 && (
        <div className="empty-state">
          <span className="empty-emoji">🧬</span>
          Nenhuma raça cadastrada ainda.
        </div>
      )}

      {racas.length > 0 && racasFiltradas.length === 0 && (
        <div className="empty-state">
          <span className="empty-emoji">🧬</span>
          Nenhuma raça encontrada.
        </div>
      )}

      {racasFiltradas.length > 0 && (
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
              {racasFiltradas.map((r) => (
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
