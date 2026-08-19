import { useState } from 'react';
import Combobox from '../components/Combobox';
import SeletorCidade from '../components/SeletorCidade';
import { useConfirm } from '../components/ConfirmDialog';

const VAZIO = { nome: '', especie_id: '', raca_id: '', data_nascimento: '', cidade_id: '' };
const IDADE_MAXIMA_ANOS = 30;

export default function FormAnimal({ animalInicial, especies, racas, cidades, onSalvar, onCancelar }) {
  const confirmar = useConfirm();
  const valorInicial = animalInicial
    ? {
        ...VAZIO,
        ...animalInicial,
        especie_id: animalInicial.especie_id || '',
        raca_id: animalInicial.raca_id || '',
        data_nascimento: animalInicial.data_nascimento?.slice(0, 10) || '',
        cidade_id: animalInicial.cidade_id || '',
      }
    : VAZIO;
  const [form, setForm] = useState(valorInicial);

  const racasDaEspecie = racas.filter((r) => String(r.especie_id) === String(form.especie_id));

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEspecieChange(especieId) {
    setForm((prev) => ({ ...prev, especie_id: especieId, raca_id: '' }));
  }

  function handleRacaChange(racaId) {
    setForm((prev) => ({ ...prev, raca_id: racaId }));
  }

  function handleCidadeChange(cidadeId) {
    setForm((prev) => ({ ...prev, cidade_id: cidadeId }));
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

  function handleSubmit(e) {
    e.preventDefault();
    onSalvar({
      nome: form.nome,
      especie_id: form.especie_id,
      raca_id: form.raca_id || null,
      data_nascimento: form.data_nascimento || null,
      cidade_id: form.cidade_id || null,
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

      <div className="form-actions">
        <button type="submit" className="btn-primario">
          Salvar
        </button>
        <button type="button" onClick={handleCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
