import { useState } from 'react';

const VAZIO = { nome: '', especie: '', raca: '', data_nascimento: '' };

const ESPECIES = [
  { valor: 'cachorro', rotulo: 'Cachorro' },
  { valor: 'gato', rotulo: 'Gato' },
  { valor: 'ave', rotulo: 'Ave' },
  { valor: 'coelho', rotulo: 'Coelho' },
  { valor: 'reptil', rotulo: 'Réptil' },
  { valor: 'outro', rotulo: 'Outro' },
];

export default function FormAnimal({ animalInicial, onSalvar, onCancelar }) {
  const [form, setForm] = useState(
    animalInicial
      ? { ...VAZIO, ...animalInicial, data_nascimento: animalInicial.data_nascimento?.slice(0, 10) || '' }
      : VAZIO
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSalvar({
      nome: form.nome,
      especie: form.especie,
      raca: form.raca || null,
      data_nascimento: form.data_nascimento || null,
    });
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>{animalInicial ? 'Editar animal' : 'Novo animal'}</h2>

      <label>
        Nome *
        <input name="nome" value={form.nome} onChange={handleChange} required />
      </label>

      <label>
        Espécie *
        <select name="especie" value={form.especie} onChange={handleChange} required>
          <option value="" disabled>
            Selecione...
          </option>
          {ESPECIES.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.rotulo}
            </option>
          ))}
        </select>
      </label>

      <label>
        Raça
        <input name="raca" value={form.raca || ''} onChange={handleChange} />
      </label>

      <label>
        Data de nascimento
        <input
          name="data_nascimento"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          value={form.data_nascimento || ''}
          onChange={handleChange}
        />
      </label>

      <div className="form-actions">
        <button type="submit">Salvar</button>
        <button type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
