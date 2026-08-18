const API_URL = 'http://localhost:3001';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) {
    return null;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.erro || `Erro ${res.status}`);
  }

  return data;
}

export const api = {
  listarAnimais: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.status) params.set('status', filtros.status);
    if (filtros.especie_id) params.set('especie_id', filtros.especie_id);
    if (filtros.cidade_id) params.set('cidade_id', filtros.cidade_id);
    const query = params.toString();
    return request(`/animais${query ? `?${query}` : ''}`);
  },
  buscarAnimal: (id) => request(`/animais/${id}`),
  criarAnimal: (animal) => request('/animais', { method: 'POST', body: JSON.stringify(animal) }),
  atualizarAnimal: (id, animal) =>
    request(`/animais/${id}`, { method: 'PUT', body: JSON.stringify(animal) }),
  excluirAnimal: (id) => request(`/animais/${id}`, { method: 'DELETE' }),
  adotarAnimal: (id, dadosAdocao) =>
    request(`/animais/${id}/adotar`, { method: 'POST', body: JSON.stringify(dadosAdocao) }),

  listarAdotantes: () => request('/adotantes'),
  criarAdotante: (adotante) =>
    request('/adotantes', { method: 'POST', body: JSON.stringify(adotante) }),
  atualizarAdotante: (id, adotante) =>
    request(`/adotantes/${id}`, { method: 'PUT', body: JSON.stringify(adotante) }),
  excluirAdotante: (id) => request(`/adotantes/${id}`, { method: 'DELETE' }),

  listarCidades: () => request('/cidades'),
  criarCidade: (cidade) => request('/cidades', { method: 'POST', body: JSON.stringify(cidade) }),
  atualizarCidade: (id, cidade) =>
    request(`/cidades/${id}`, { method: 'PUT', body: JSON.stringify(cidade) }),
  excluirCidade: (id) => request(`/cidades/${id}`, { method: 'DELETE' }),

  listarEspecies: () => request('/especies'),
  criarEspecie: (especie) => request('/especies', { method: 'POST', body: JSON.stringify(especie) }),
  atualizarEspecie: (id, especie) =>
    request(`/especies/${id}`, { method: 'PUT', body: JSON.stringify(especie) }),
  excluirEspecie: (id) => request(`/especies/${id}`, { method: 'DELETE' }),

  listarRacas: () => request('/racas'),
  criarRaca: (raca) => request('/racas', { method: 'POST', body: JSON.stringify(raca) }),
  atualizarRaca: (id, raca) => request(`/racas/${id}`, { method: 'PUT', body: JSON.stringify(raca) }),
  excluirRaca: (id) => request(`/racas/${id}`, { method: 'DELETE' }),
};
