'use client';

import { useState } from 'react';
import { formatarCPF, formatarTelefone } from '@/lib/utils';
import SeletorCidade from './seletor-cidade';
import { useConfirm } from './confirm-dialog';
import type { Adotante, Cidade } from '@/types';

const VAZIO = { nome: '', cpf: '', telefone: '', email: '', cidade_id: '' as string | number };

interface FormAdotanteProps {
  adotanteInicial?: Adotante | null;
  cidades: Cidade[];
  onSalvar: (dados: Record<string, unknown>) => void;
  onCancelar: () => void;
}

export default function FormAdotante({ adotanteInicial, cidades, onSalvar, onCancelar }: FormAdotanteProps) {
  const confirmar = useConfirm();
  const valorInicial = adotanteInicial
    ? {
        nome: adotanteInicial.nome,
        cpf: formatarCPF(adotanteInicial.cpf || ''),
        telefone: adotanteInicial.telefone ? formatarTelefone(adotanteInicial.telefone) : '',
        email: adotanteInicial.email || '',
        cidade_id: adotanteInicial.cidade_id || '',
      }
    : VAZIO;
  const [form, setForm] = useState(valorInicial);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setForm((prev) => ({ ...prev, cpf: formatarCPF(value) }));
      return;
    }
    if (name === 'telefone') {
      setForm((prev) => ({ ...prev, telefone: formatarTelefone(value) }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCidadeChange(cidadeId: string | number) {
    setForm((prev) => ({ ...prev, cidade_id: cidadeId }));
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
    onSalvar({
      nome: form.nome,
      cpf: form.cpf,
      telefone: form.telefone || null,
      email: form.email || null,
      cidade_id: form.cidade_id || null,
    });
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>{adotanteInicial ? 'Editar adotante' : 'Novo adotante'}</h2>
      <label>
        Nome *
        <input name="nome" value={form.nome} onChange={handleChange} maxLength={150} required />
      </label>
      <label>
        CPF *
        <input
          name="cpf"
          value={form.cpf}
          onChange={handleChange}
          placeholder="000.000.000-00"
          maxLength={14}
          required
        />
      </label>
      <label>
        Telefone
        <input
          name="telefone"
          value={form.telefone}
          onChange={handleChange}
          placeholder="(00) 00000-0000"
          maxLength={15}
        />
      </label>
      <label>
        E-mail
        <input name="email" type="email" value={form.email} onChange={handleChange} maxLength={150} />
      </label>
      <SeletorCidade cidades={cidades} value={form.cidade_id} onChange={handleCidadeChange} />
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
