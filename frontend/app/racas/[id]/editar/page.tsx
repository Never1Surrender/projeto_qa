'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormRaca from '@/components/form-raca';
import { api } from '@/lib/api';
import { useNotificacao } from '@/components/notificacoes';
import type { Especie, Raca } from '@/types';

export default function EditarRacaPage() {
  const router = useRouter();
  const notificar = useNotificacao();
  const params = useParams<{ id: string }>();
  const [raca, setRaca] = useState<Raca | null>(null);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([api.listarRacas(), api.listarEspecies()])
      .then(([racas, especiesLista]) => {
        const encontrada = racas.find((r) => String(r.id) === params.id);
        setRaca(encontrada ?? null);
        setEspecies(especiesLista);
      })
      .catch((e) => notificar('erro', (e as Error).message))
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function salvar(dados: { nome: string; especie_id: string | number }) {
    try {
      await api.atualizarRaca(params.id, dados);
      notificar('sucesso', 'Raça atualizada com sucesso!');
      router.push('/racas');
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  if (carregando) return null;
  if (!raca) return <div className="empty-state">Raça não encontrada.</div>;

  return <FormRaca racaInicial={raca} especies={especies} onSalvar={salvar} onCancelar={() => router.push('/racas')} />;
}
