'use client';

import { useState } from 'react';
import Combobox from './combobox';
import { useConfirm } from './confirm-dialog';
import type { Especie, Raca } from '@/types';

const VAZIO = { nome: '', especie_id: '' as string | number };

interface FormRacaProps {
  racaInicial?: Raca | null;
  especies: Especie[];
  onSalvar: (dados: typeof VAZIO) => void;
  onCancelar: () => void;
}

export default function FormRaca({ racaInicial, especies, onSalvar, onCancelar }: FormRacaProps) {
  const confirmar = useConfirm();
  const valorInicial = racaInicial ? { nome: racaInicial.nome, especie_id: racaInicial.especie_id } : VAZIO;
  const [form, setForm] = useState(valorInicial);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEspecieChange(especieId: string | number) {
    setForm((prev) => ({ ...prev, especie_id: especieId }));
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
      <h2>{racaInicial ? 'Editar raça' : 'Nova raça'}</h2>
      <label>
        Nome *
        <input name="nome" value={form.nome} onChange={handleChange} maxLength={100} required />
      </label>
      <label>
        Espécie *
        <Combobox
          options={especies.map((e) => ({ value: e.id, label: e.nome }))}
          value={form.especie_id}
          onChange={handleEspecieChange}
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
