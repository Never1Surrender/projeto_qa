import type {
  Adotante,
  Animal,
  Cidade,
  Especie,
  FiltrosAdotantes,
  FiltrosAnimais,
  ListaResultado,
  Raca,
} from '@/types';

const API_URL = 'http://localhost:3001';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) {
    return null as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.erro || `Erro ${res.status}`);
  }

  return data as T;
}

async function uploadFoto(arquivo: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('foto', arquivo);
  const res = await fetch(`${API_URL}/uploads`, { method: 'POST', body: formData });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.erro || `Erro ${res.status}`);
  }
  return data;
}

export const api = {
  uploadFoto,

  listarAnimais: (filtros: FiltrosAnimais = {}) => {
    const params = new URLSearchParams();
    if (filtros.status) params.set('status', filtros.status);
    if (filtros.especie_id) params.set('especie_id', String(filtros.especie_id));
    if (filtros.cidade_id) params.set('cidade_id', String(filtros.cidade_id));
    if (filtros.busca) params.set('busca', filtros.busca);
    if (filtros.ordenar) params.set('ordenar', filtros.ordenar);
    if (filtros.direcao) params.set('direcao', filtros.direcao);
    if (filtros.page) params.set('page', String(filtros.page));
    if (filtros.limit) params.set('limit', String(filtros.limit));
    const query = params.toString();
    return request<ListaResultado<Animal>>(`/animais${query ? `?${query}` : ''}`);
  },
  buscarAnimal: (id: number | string) => request<Animal>(`/animais/${id}`),
  criarAnimal: (animal: Record<string, unknown>) =>
    request<Animal>('/animais', { method: 'POST', body: JSON.stringify(animal) }),
  atualizarAnimal: (id: number | string, animal: Record<string, unknown>) =>
    request<Animal>(`/animais/${id}`, { method: 'PUT', body: JSON.stringify(animal) }),
  excluirAnimal: (id: number | string) => request<null>(`/animais/${id}`, { method: 'DELETE' }),
  adotarAnimal: (id: number | string, dadosAdocao: Record<string, unknown>) =>
    request<Animal>(`/animais/${id}/adotar`, { method: 'POST', body: JSON.stringify(dadosAdocao) }),

  listarAdotantes: (filtros: FiltrosAdotantes = {}) => {
    const params = new URLSearchParams();
    if (filtros.busca) params.set('busca', filtros.busca);
    if (filtros.ordenar) params.set('ordenar', filtros.ordenar);
    if (filtros.direcao) params.set('direcao', filtros.direcao);
    if (filtros.page) params.set('page', String(filtros.page));
    if (filtros.limit) params.set('limit', String(filtros.limit));
    const query = params.toString();
    return request<ListaResultado<Adotante>>(`/adotantes${query ? `?${query}` : ''}`);
  },
  buscarAdotante: (id: number | string) => request<Adotante>(`/adotantes/${id}`),
  criarAdotante: (adotante: Record<string, unknown>) =>
    request<Adotante>('/adotantes', { method: 'POST', body: JSON.stringify(adotante) }),
  atualizarAdotante: (id: number | string, adotante: Record<string, unknown>) =>
    request<Adotante>(`/adotantes/${id}`, { method: 'PUT', body: JSON.stringify(adotante) }),
  excluirAdotante: (id: number | string) => request<null>(`/adotantes/${id}`, { method: 'DELETE' }),

  listarCidades: () => request<Cidade[]>('/cidades'),
  criarCidade: (cidade: Record<string, unknown>) =>
    request<Cidade>('/cidades', { method: 'POST', body: JSON.stringify(cidade) }),
  atualizarCidade: (id: number | string, cidade: Record<string, unknown>) =>
    request<Cidade>(`/cidades/${id}`, { method: 'PUT', body: JSON.stringify(cidade) }),
  excluirCidade: (id: number | string) => request<null>(`/cidades/${id}`, { method: 'DELETE' }),

  listarEspecies: () => request<Especie[]>('/especies'),
  criarEspecie: (especie: Record<string, unknown>) =>
    request<Especie>('/especies', { method: 'POST', body: JSON.stringify(especie) }),
  atualizarEspecie: (id: number | string, especie: Record<string, unknown>) =>
    request<Especie>(`/especies/${id}`, { method: 'PUT', body: JSON.stringify(especie) }),
  excluirEspecie: (id: number | string) => request<null>(`/especies/${id}`, { method: 'DELETE' }),

  listarRacas: () => request<Raca[]>('/racas'),
  criarRaca: (raca: Record<string, unknown>) => request<Raca>('/racas', { method: 'POST', body: JSON.stringify(raca) }),
  atualizarRaca: (id: number | string, raca: Record<string, unknown>) =>
    request<Raca>(`/racas/${id}`, { method: 'PUT', body: JSON.stringify(raca) }),
  excluirRaca: (id: number | string) => request<null>(`/racas/${id}`, { method: 'DELETE' }),
};
