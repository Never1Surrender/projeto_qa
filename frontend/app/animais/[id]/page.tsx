'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DetalheAnimal from '@/components/detalhe-animal';
import { api } from '@/lib/api';
import { useNotificacao } from '@/components/notificacoes';
import type { Animal } from '@/types';

export default function DetalheAnimalPage() {
  const router = useRouter();
  const notificar = useNotificacao();
  const params = useParams<{ id: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .buscarAnimal(params.id)
      .then(setAnimal)
      .catch((e) => notificar('erro', (e as Error).message))
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (carregando) return null;
  if (!animal) return <div className="empty-state">Animal não encontrado.</div>;

  return (
    <DetalheAnimal
      animal={animal}
      onEditar={(a) => router.push(`/animais/${a.id}/editar`)}
      onAdotar={(a) => router.push(`/animais/${a.id}/adotar`)}
      onVoltar={() => router.push('/animais')}
    />
  );
}
