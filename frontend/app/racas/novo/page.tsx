'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FormRaca from '@/components/form-raca';
import { api } from '@/lib/api';
import { useNotificacao } from '@/components/notificacoes';
import type { Especie } from '@/types';

export default function NovaRacaPage() {
  const router = useRouter();
  const notificar = useNotificacao();
  const [especies, setEspecies] = useState<Especie[]>([]);

  useEffect(() => {
    api.listarEspecies().then(setEspecies).catch((e) => notificar('erro', (e as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function salvar(dados: { nome: string; especie_id: string | number }) {
    try {
      await api.criarRaca(dados);
      notificar('sucesso', 'Raça cadastrada com sucesso!');
      router.push('/racas');
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  return <FormRaca especies={especies} onSalvar={salvar} onCancelar={() => router.push('/racas')} />;
}
