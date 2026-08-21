'use client';

import { useEffect, useState } from 'react';
import Combobox from './combobox';
import { ESTADOS_BR } from '@/lib/constants';
import type { Cidade } from '@/types';

interface SeletorCidadeProps {
  cidades: Cidade[];
  value: string | number;
  onChange: (value: string | number) => void;
  required?: boolean;
}

export default function SeletorCidade({ cidades, value, onChange, required }: SeletorCidadeProps) {
  const cidadeAtual = cidades.find((c) => String(c.id) === String(value));
  const [estado, setEstado] = useState(cidadeAtual?.estado ?? '');

  useEffect(() => {
    setEstado(cidadeAtual?.estado ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const opcoesEstado = ESTADOS_BR.map((uf) => ({ value: uf.sigla, label: uf.sigla }));
  const opcoesCidade = cidades.filter((c) => c.estado === estado).map((c) => ({ value: c.id, label: c.nome }));

  function handleEstadoChange(novoEstado: string | number) {
    setEstado(String(novoEstado));
    onChange('');
  }

  return (
    <>
      <label>
        Estado
        <Combobox
          options={opcoesEstado}
          value={estado}
          onChange={handleEstadoChange}
          placeholder="Digite ou selecione o estado..."
        />
      </label>
      <label>
        Cidade
        <Combobox
          options={opcoesCidade}
          value={value}
          onChange={onChange}
          placeholder={estado ? 'Digite ou selecione a cidade...' : 'Selecione um estado primeiro'}
          disabled={!estado}
          required={required}
        />
      </label>
    </>
  );
}
