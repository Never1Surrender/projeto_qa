'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormCidade from '@/components/form-cidade';
import { api } from '@/lib/api';
import { useNotificacao } from '@/components/notificacoes';
import type { Cidade } from '@/types';

export default function EditarCidadePage() {
  const router = useRouter();
  const notificar = useNotificacao();
  const params = useParams<{ id: string }>();
  const [cidade, setCidade] = useState<Cidade | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .listarCidades()
      .then((lista) => {
        const encontrada = lista.find((c) => String(c.id) === params.id);
        setCidade(encontrada ?? null);
      })
      .catch((e) => notificar('erro', (e as Error).message))
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function salvar(dados: Partial<Cidade>) {
    try {
      await api.atualizarCidade(params.id, dados);
      notificar('sucesso', 'Cidade atualizada com sucesso!');
      router.push('/cidades');
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  if (carregando) return null;
  if (!cidade) return <div className="empty-state">Cidade não encontrada.</div>;

  return <FormCidade cidadeInicial={cidade} onSalvar={salvar} onCancelar={() => router.push('/cidades')} />;
}
