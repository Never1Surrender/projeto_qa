'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormAdotante from '@/components/form-adotante';
import { api } from '@/lib/api';
import { useNotificacao } from '@/components/notificacoes';
import type { Adotante, Cidade } from '@/types';

export default function EditarAdotantePage() {
  const router = useRouter();
  const notificar = useNotificacao();
  const params = useParams<{ id: string }>();
  const [adotante, setAdotante] = useState<Adotante | null>(null);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([api.buscarAdotante(params.id), api.listarCidades()])
      .then(([a, c]) => {
        setAdotante(a);
        setCidades(c);
      })
      .catch((e) => notificar('erro', (e as Error).message))
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function salvar(dados: Record<string, unknown>) {
    try {
      await api.atualizarAdotante(params.id, dados);
      notificar('sucesso', 'Adotante atualizado com sucesso!');
      router.push('/adotantes');
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  if (carregando) return null;
  if (!adotante) return <div className="empty-state">Adotante não encontrado.</div>;

  return (
    <FormAdotante
      adotanteInicial={adotante}
      cidades={cidades}
      onSalvar={salvar}
      onCancelar={() => router.push('/adotantes')}
    />
  );
}
