'use client';

import { useState } from 'react';
import Combobox from './combobox';
import { useConfirm } from './confirm-dialog';
import { ESTADOS_BR } from '@/lib/constants';
import type { Cidade } from '@/types';

const VAZIO = { nome: '', estado: '' };

interface FormCidadeProps {
  cidadeInicial?: Cidade | null;
  onSalvar: (dados: typeof VAZIO) => void;
  onCancelar: () => void;
}

export default function FormCidade({ cidadeInicial, onSalvar, onCancelar }: FormCidadeProps) {
  const confirmar = useConfirm();
  const valorInicial = cidadeInicial ? { nome: cidadeInicial.nome, estado: cidadeInicial.estado } : VAZIO;
  const [form, setForm] = useState(valorInicial);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEstadoChange(estado: string | number) {
    setForm((prev) => ({ ...prev, estado: String(estado) }));
  }

  async function cancelar() {
    const alterado = JSON.stringify(form) !== JSON.stringify(valorInicial);
    if (alterado) {
      const ok = await confirmar('Você tem alterações não salvas. Deseja realmente cancelar?', {
        textoConfirmar: 'Descartar',
        perigo: true,
      });
      if (!ok) return;
    }
    onCancelar();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSalvar(form);
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>{cidadeInicial ? 'Editar cidade' : 'Nova cidade'}</h2>
      <label>
        Nome *
        <input name="nome" value={form.nome} onChange={handleChange} maxLength={100} required />
      </label>
      <label>
        Estado (UF) *
        <Combobox
          options={ESTADOS_BR.map((uf) => ({ value: uf.sigla, label: uf.sigla }))}
          value={form.estado}
          onChange={handleEstadoChange}
          placeholder="Digite ou selecione..."
          required
        />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn-primario">
          Salvar
        </button>
        <button type="button" onClick={cancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
