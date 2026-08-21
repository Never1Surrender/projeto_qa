'use client';

import { useRef, useState } from 'react';
import Combobox from './combobox';
import SeletorCidade from './seletor-cidade';
import { useConfirm } from './confirm-dialog';
import { useNotificacao } from './notificacoes';
import { api } from '@/lib/api';
import type { Animal, Cidade, Especie, Raca } from '@/types';

const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const VAZIO = { nome: '', especie_id: '', raca_id: '', data_nascimento: '', cidade_id: '', foto_url: '' };
const IDADE_MAXIMA_ANOS = 30;

interface FormAnimalProps {
  animalInicial?: Animal | null;
  especies: Especie[];
  racas: Raca[];
  cidades: Cidade[];
  onSalvar: (dados: Record<string, unknown>) => void;
  onCancelar: () => void;
}

export default function FormAnimal({ animalInicial, especies, racas, cidades, onSalvar, onCancelar }: FormAnimalProps) {
  const confirmar = useConfirm();
  const notificar = useNotificacao();
  const inputFotoRef = useRef<HTMLInputElement>(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const valorInicial = animalInicial
    ? {
        ...VAZIO,
        nome: animalInicial.nome,
        especie_id: animalInicial.especie_id || '',
        raca_id: animalInicial.raca_id || '',
        data_nascimento: animalInicial.data_nascimento?.slice(0, 10) || '',
        cidade_id: animalInicial.cidade_id || '',
        foto_url: animalInicial.foto_url || '',
      }
    : VAZIO;
  const [form, setForm] = useState(valorInicial);

  const racasDaEspecie = racas.filter((r) => String(r.especie_id) === String(form.especie_id));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEspecieChange(especieId: string | number) {
    setForm((prev) => ({ ...prev, especie_id: String(especieId), raca_id: '' }));
  }

  function handleRacaChange(racaId: string | number) {
    setForm((prev) => ({ ...prev, raca_id: String(racaId) }));
  }

  function handleCidadeChange(cidadeId: string | number) {
    setForm((prev) => ({ ...prev, cidade_id: String(cidadeId) }));
  }

  async function handleArquivoFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      notificar('erro', 'Formato não suportado. Use JPEG, PNG, WEBP ou GIF.');
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
      notificar('erro', `Arquivo muito grande (máx. ${TAMANHO_MAXIMO_BYTES / 1024 / 1024}MB).`);
      return;
    }

    setEnviandoFoto(true);
    try {
      const { url } = await api.uploadFoto(arquivo);
      setForm((prev) => ({ ...prev, foto_url: url }));
    } catch (err) {
      notificar('erro', (err as Error).message);
    } finally {
      setEnviandoFoto(false);
    }
  }

  function removerFoto() {
    setForm((prev) => ({ ...prev, foto_url: '' }));
  }

  async function handleCancelar() {
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
      especie_id: form.especie_id,
      raca_id: form.raca_id || null,
      data_nascimento: form.data_nascimento || null,
      cidade_id: form.cidade_id || null,
      foto_url: form.foto_url || null,
    });
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>{animalInicial ? 'Editar animal' : 'Novo animal'}</h2>

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

      <label>
        Raça
        <Combobox
          options={racasDaEspecie.map((r) => ({ value: r.id, label: r.nome }))}
          value={form.raca_id}
          onChange={handleRacaChange}
          placeholder={form.especie_id ? 'Digite ou selecione...' : 'Selecione uma espécie primeiro'}
          disabled={!form.especie_id}
        />
      </label>

      <label>
        Data de nascimento
        <input
          name="data_nascimento"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          min={new Date(new Date().setFullYear(new Date().getFullYear() - IDADE_MAXIMA_ANOS))
            .toISOString()
            .slice(0, 10)}
          value={form.data_nascimento || ''}
          onChange={handleChange}
        />
      </label>

      <SeletorCidade cidades={cidades} value={form.cidade_id} onChange={handleCidadeChange} />

      <label>
        Foto
        <div className="campo-foto">
          {form.foto_url && (
            <span className="campo-foto-preview">
              <img src={form.foto_url} alt="Pré-visualização" />
            </span>
          )}
          <div className="campo-foto-acoes">
            <input
              ref={inputFotoRef}
              type="file"
              accept={TIPOS_ACEITOS.join(',')}
              onChange={handleArquivoFoto}
              disabled={enviandoFoto}
              hidden
            />
            <button type="button" onClick={() => inputFotoRef.current?.click()} disabled={enviandoFoto}>
              {enviandoFoto ? 'Enviando...' : form.foto_url ? 'Trocar foto' : 'Escolher foto'}
            </button>
            {form.foto_url && (
              <button type="button" className="btn-perigo" onClick={removerFoto} disabled={enviandoFoto}>
                Remover
              </button>
            )}
          </div>
        </div>
      </label>

      <div className="form-actions">
        <button type="submit" className="btn-primario" disabled={enviandoFoto}>
          Salvar
        </button>
        <button type="button" onClick={handleCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
