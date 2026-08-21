'use client';

import { useState } from 'react';
import { useConfirm } from './confirm-dialog';
import type { Especie } from '@/types';

const VAZIO = { nome: '' };

interface FormEspecieProps {
  especieInicial?: Especie | null;
  onSalvar: (dados: typeof VAZIO) => void;
  onCancelar: () => void;
}

export default function FormEspecie({ especieInicial, onSalvar, onCancelar }: FormEspecieProps) {
  const confirmar = useConfirm();
  const valorInicial = especieInicial ? { nome: especieInicial.nome } : VAZIO;
  const [form, setForm] = useState(valorInicial);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      <h2>{especieInicial ? 'Editar espécie' : 'Nova espécie'}</h2>
      <label>
        Nome *
        <input name="nome" value={form.nome} onChange={handleChange} maxLength={50} required />
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
