'use client';

import { useRouter } from 'next/navigation';
import FormEspecie from '@/components/form-especie';
import { api } from '@/lib/api';
import { useNotificacao } from '@/components/notificacoes';
import type { Especie } from '@/types';

export default function NovaEspeciePage() {
  const router = useRouter();
  const notificar = useNotificacao();

  async function salvar(dados: Partial<Especie>) {
    try {
      await api.criarEspecie(dados);
      notificar('sucesso', 'Espécie cadastrada com sucesso!');
      router.push('/especies');
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  return <FormEspecie onSalvar={salvar} onCancelar={() => router.push('/especies')} />;
}
