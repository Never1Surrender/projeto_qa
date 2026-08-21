'use client';

import { useRouter } from 'next/navigation';
import FormCidade from '@/components/form-cidade';
import { api } from '@/lib/api';
import { useNotificacao } from '@/components/notificacoes';
import type { Cidade } from '@/types';

export default function NovaCidadePage() {
  const router = useRouter();
  const notificar = useNotificacao();

  async function salvar(dados: Partial<Cidade>) {
    try {
      await api.criarCidade(dados);
      notificar('sucesso', 'Cidade cadastrada com sucesso!');
      router.push('/cidades');
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  return <FormCidade onSalvar={salvar} onCancelar={() => router.push('/cidades')} />;
}
