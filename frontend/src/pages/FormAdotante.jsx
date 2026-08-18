import { useState } from 'react';
import { formatarCPF, formatarTelefone } from '../utils';

export default function FormAdotante({ animal, adotantes, cidades, onAdotar, onCancelar }) {
  const [adotanteId, setAdotanteId] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cidadeId, setCidadeId] = useState('');

  function handleSubmit(e) {
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
