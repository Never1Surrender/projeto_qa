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
    if (filtros.especie) params.set('especie', filtros.especie);
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
};
