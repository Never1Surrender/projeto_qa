export type StatusAnimal = 'disponivel' | 'adotado';

export interface Animal {
  id: number;
  nome: string;
  especie_id: number;
  raca_id: number | null;
  data_nascimento: string | null;
  status: StatusAnimal;
  adotante_id: number | null;
  cidade_id: number | null;
  foto_url: string | null;
  criado_em: string;
  especie_nome: string;
  raca_nome: string | null;
  cidade_nome: string | null;
  cidade_estado: string | null;
  adotante_nome: string | null;
  idade: number | null;
}

export interface Adotante {
  id: number;
  nome: string;
  cpf: string;
  telefone: string | null;
  email: string | null;
  cidade_id: number | null;
  criado_em: string;
  cidade_nome: string | null;
  cidade_estado: string | null;
}

export interface Cidade {
  id: number;
  nome: string;
  estado: string;
}

export interface Especie {
  id: number;
  nome: string;
}

export interface Raca {
  id: number;
  nome: string;
  especie_id: number;
  especie_nome: string;
}

export interface ListaResultado<T> {
  dados: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
  limite: number;
}

export interface FiltrosAnimais {
  status?: string;
  especie_id?: string | number;
  cidade_id?: string | number;
  busca?: string;
  ordenar?: string;
  direcao?: string;
  page?: number;
  limit?: number;
}

export interface FiltrosAdotantes {
  busca?: string;
  ordenar?: string;
  direcao?: string;
  page?: number;
  limit?: number;
}
