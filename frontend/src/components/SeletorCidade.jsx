import { useEffect, useState } from 'react';
import Combobox from './Combobox';
import { ESTADOS_BR } from '../constants';

export default function SeletorCidade({ cidades, value, onChange, required }) {
  const cidadeAtual = cidades.find((c) => String(c.id) === String(value));
  const [estado, setEstado] = useState(cidadeAtual?.estado ?? '');

  useEffect(() => {
    setEstado(cidadeAtual?.estado ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const opcoesEstado = ESTADOS_BR.map((uf) => ({ value: uf.sigla, label: uf.sigla }));
  const opcoesCidade = cidades
    .filter((c) => c.estado === estado)
    .map((c) => ({ value: c.id, label: c.nome }));

  function handleEstadoChange(novoEstado) {
    setEstado(novoEstado);
    onChange('');
  }

  return (
    <>
      <label>
        Estado
        <Combobox
          options={opcoesEstado}
          value={estado}
          onChange={handleEstadoChange}
          placeholder="Digite ou selecione o estado..."
        />
      </label>
      <label>
        Cidade
        <Combobox
          options={opcoesCidade}
          value={value}
          onChange={onChange}
          placeholder={estado ? 'Digite ou selecione a cidade...' : 'Selecione um estado primeiro'}
          disabled={!estado}
          required={required}
        />
      </label>
    </>
  );
}
