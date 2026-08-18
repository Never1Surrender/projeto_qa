import { useState } from 'react';

const VAZIO = { nome: '', especie_id: '', raca_id: '', data_nascimento: '', cidade_id: '' };
const IDADE_MAXIMA_ANOS = 30;

export default function FormAnimal({ animalInicial, especies, racas, cidades, onSalvar, onCancelar }) {
  const [form, setForm] = useState(
    animalInicial
      ? {
          ...VAZIO,
          ...animalInicial,
          especie_id: animalInicial.especie_id || '',
          raca_id: animalInicial.raca_id || '',
          data_nascimento: animalInicial.data_nascimento?.slice(0, 10) || '',
          cidade_id: animalInicial.cidade_id || '',
        }
      : VAZIO
  );

  const racasDaEspecie = racas.filter((r) => String(r.especie_id) === String(form.especie_id));

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'especie_id') {
      setForm((prev) => ({ ...prev, especie_id: value, raca_id: '' }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
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
        <select name="especie_id" value={form.especie_id} onChange={handleChange} required>
          <option value="" disabled>
            Selecione...
          </option>
          {especies.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
      </label>

      <label>
        Raça
        <select name="raca_id" value={form.raca_id} onChange={handleChange} disabled={!form.especie_id}>
          <option value="">-- Não informado --</option>
          {racasDaEspecie.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nome}
            </option>
          ))}
        </select>
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

      <label>
        Cidade
        <select name="cidade_id" value={form.cidade_id} onChange={handleChange}>
          <option value="">-- Não informado --</option>
          {cidades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}/{c.estado}
            </option>
          ))}
        </select>
      </label>

      <div className="form-actions">
        <button type="submit" className="btn-primario">
          Salvar
        </button>
        <button type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
