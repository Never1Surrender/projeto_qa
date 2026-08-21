'use client';

import { useState } from 'react';
import { formatarCPF, formatarTelefone } from '@/lib/utils';
import SeletorCidade from './seletor-cidade';
import { useConfirm } from './confirm-dialog';
import type { Adotante, Animal, Cidade } from '@/types';

interface FormAdocaoProps {
  animal: Animal;
  adotantes: Adotante[];
  cidades: Cidade[];
  onAdotar: (dados: Record<string, unknown>) => void;
  onCancelar: () => void;
}

export default function FormAdocao({ animal, adotantes, cidades, onAdotar, onCancelar }: FormAdocaoProps) {
  const confirmar = useConfirm();
  const [adotanteId, setAdotanteId] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cidadeId, setCidadeId] = useState<string | number>('');

  async function handleCancelar() {
    const alterado = Boolean(adotanteId || nome || cpf || telefone || email || cidadeId);
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
    if (adotanteId) {
      onAdotar({ adotante_id: Number(adotanteId) });
    } else {
      onAdotar({ nome, cpf, telefone: telefone || null, email: email || null, cidade_id: cidadeId || null });
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>Adotar {animal.nome}</h2>

      <label>
        Adotante já cadastrado
        <select value={adotanteId} onChange={(e) => setAdotanteId(e.target.value)}>
          <option value="">-- Cadastrar novo adotante --</option>
          {adotantes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome} ({formatarCPF(a.cpf)})
            </option>
          ))}
        </select>
      </label>

      {!adotanteId && (
        <>
          <label>
            Nome do adotante *
            <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={150} required />
          </label>
          <label>
            CPF *
            <input
              value={cpf}
              onChange={(e) => setCpf(formatarCPF(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
          </label>
          <label>
            Telefone
            <input
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </label>
          <label>
            E-mail
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={150} />
          </label>
          <SeletorCidade cidades={cidades} value={cidadeId} onChange={setCidadeId} />
        </>
      )}

      <div className="form-actions">
        <button type="submit" className="btn-secundario">
          Confirmar adoção
        </button>
        <button type="button" onClick={handleCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
