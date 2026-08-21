'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormAdocao from '@/components/form-adocao';
import { api } from '@/lib/api';
import { useNotificacao } from '@/components/notificacoes';
import type { Adotante, Animal, Cidade } from '@/types';

export default function AdotarAnimalPage() {
  const router = useRouter();
  const notificar = useNotificacao();
  const params = useParams<{ id: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [adotantes, setAdotantes] = useState<Adotante[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([api.buscarAnimal(params.id), api.listarAdotantes({ limit: 100 }), api.listarCidades()])
      .then(([a, adotantesResultado, c]) => {
        setAnimal(a);
        setAdotantes(adotantesResultado.dados);
        setCidades(c);
      })
      .catch((e) => notificar('erro', (e as Error).message))
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function confirmarAdocao(dados: Record<string, unknown>) {
    try {
      await api.adotarAnimal(params.id, dados);
      notificar('sucesso', 'Adoção registrada com sucesso!');
      router.push('/animais');
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  if (carregando) return null;
  if (!animal) return <div className="empty-state">Animal não encontrado.</div>;

  return (
    <FormAdocao
      animal={animal}
      adotantes={adotantes}
      cidades={cidades}
      onAdotar={confirmarAdocao}
      onCancelar={() => router.push('/animais')}
    />
  );
}
