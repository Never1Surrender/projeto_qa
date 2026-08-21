'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormAnimal from '@/components/form-animal';
import { api } from '@/lib/api';
import { useNotificacao } from '@/components/notificacoes';
import type { Animal, Cidade, Especie, Raca } from '@/types';

export default function EditarAnimalPage() {
  const router = useRouter();
  const notificar = useNotificacao();
  const params = useParams<{ id: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [racas, setRacas] = useState<Raca[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([api.buscarAnimal(params.id), api.listarCidades(), api.listarEspecies(), api.listarRacas()])
      .then(([a, c, e, r]) => {
        setAnimal(a);
        setCidades(c);
        setEspecies(e);
        setRacas(r);
      })
      .catch((e) => notificar('erro', (e as Error).message))
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function salvar(dados: Record<string, unknown>) {
    try {
      await api.atualizarAnimal(params.id, dados);
      notificar('sucesso', 'Animal atualizado com sucesso!');
      router.push('/animais');
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  if (carregando) return null;
  if (!animal) return <div className="empty-state">Animal não encontrado.</div>;

  return (
    <FormAnimal
      animalInicial={animal}
      especies={especies}
      racas={racas}
      cidades={cidades}
      onSalvar={salvar}
      onCancelar={() => router.push('/animais')}
    />
  );
}
