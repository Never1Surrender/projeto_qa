'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FormAdotante from '@/components/form-adotante';
import { api } from '@/lib/api';
import { useNotificacao } from '@/components/notificacoes';
import type { Cidade } from '@/types';

export default function NovoAdotantePage() {
  const router = useRouter();
  const notificar = useNotificacao();
  const [cidades, setCidades] = useState<Cidade[]>([]);

  useEffect(() => {
    api.listarCidades().then(setCidades).catch((e) => notificar('erro', (e as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function salvar(dados: Record<string, unknown>) {
    try {
      await api.criarAdotante(dados);
      notificar('sucesso', 'Adotante cadastrado com sucesso!');
      router.push('/adotantes');
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  return <FormAdotante cidades={cidades} onSalvar={salvar} onCancelar={() => router.push('/adotantes')} />;
}
