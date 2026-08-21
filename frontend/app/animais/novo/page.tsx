'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FormAnimal from '@/components/form-animal';
import { api } from '@/lib/api';
import { useNotificacao } from '@/components/notificacoes';
import type { Cidade, Especie, Raca } from '@/types';

export default function NovoAnimalPage() {
  const router = useRouter();
  const notificar = useNotificacao();
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [racas, setRacas] = useState<Raca[]>([]);

  useEffect(() => {
    Promise.all([api.listarCidades(), api.listarEspecies(), api.listarRacas()])
      .then(([c, e, r]) => {
        setCidades(c);
        setEspecies(e);
        setRacas(r);
      })
      .catch((e) => notificar('erro', (e as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function salvar(dados: Record<string, unknown>) {
    try {
      await api.criarAnimal(dados);
      notificar('sucesso', 'Animal cadastrado com sucesso!');
      router.push('/animais');
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  return (
    <FormAnimal
      especies={especies}
      racas={racas}
      cidades={cidades}
      onSalvar={salvar}
      onCancelar={() => router.push('/animais')}
    />
  );
}
