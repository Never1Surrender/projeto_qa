'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormEspecie from '@/components/form-especie';
import { api } from '@/lib/api';
import { useNotificacao } from '@/components/notificacoes';
import type { Especie } from '@/types';

export default function EditarEspeciePage() {
  const router = useRouter();
  const notificar = useNotificacao();
  const params = useParams<{ id: string }>();
  const [especie, setEspecie] = useState<Especie | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .listarEspecies()
      .then((lista) => {
        const encontrada = lista.find((e) => String(e.id) === params.id);
        setEspecie(encontrada ?? null);
      })
      .catch((e) => notificar('erro', (e as Error).message))
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function salvar(dados: Partial<Especie>) {
    try {
      await api.atualizarEspecie(params.id, dados);
      notificar('sucesso', 'Espécie atualizada com sucesso!');
      router.push('/especies');
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  if (carregando) return null;
  if (!especie) return <div className="empty-state">Espécie não encontrada.</div>;

  return <FormEspecie especieInicial={especie} onSalvar={salvar} onCancelar={() => router.push('/especies')} />;
}
