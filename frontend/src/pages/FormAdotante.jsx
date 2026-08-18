import { useState } from 'react';

export default function FormAdotante({ animal, adotantes, cidades, onAdotar, onCancelar }) {
  const [adotanteId, setAdotanteId] = useState('');
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [cidadeId, setCidadeId] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (adotanteId) {
      onAdotar({ adotante_id: Number(adotanteId) });
    } else {
      onAdotar({ nome, contato, cidade_id: cidadeId || null });
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
              {a.nome} ({a.contato})
            </option>
          ))}
        </select>
      </label>

      {!adotanteId && (
        <>
          <label>
            Nome do adotante *
            <input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </label>
          <label>
            Contato (telefone/email) *
            <input value={contato} onChange={(e) => setContato(e.target.value)} required />
          </label>
          <label>
            Cidade
            <select value={cidadeId} onChange={(e) => setCidadeId(e.target.value)}>
              <option value="">-- Não informado --</option>
              {cidades.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}/{c.estado}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      <div className="form-actions">
        <button type="submit" className="btn-secundario">
          Confirmar adoção
        </button>
        <button type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
