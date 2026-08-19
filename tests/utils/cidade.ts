const CIDADES_BR = [
  { nome: 'Recife', estado: 'PE' },
  { nome: 'Fortaleza', estado: 'CE' },
  { nome: 'Salvador', estado: 'BA' },
  { nome: 'Manaus', estado: 'AM' },
  { nome: 'Curitiba', estado: 'PR' },
  { nome: 'Porto Alegre', estado: 'RS' },
  { nome: 'Belo Horizonte', estado: 'MG' },
  { nome: 'Vitória', estado: 'ES' },
  { nome: 'Goiânia', estado: 'GO' },
  { nome: 'Natal', estado: 'RN' },
  { nome: 'Florianópolis', estado: 'SC' },
  { nome: 'Cuiabá', estado: 'MT' },
];

/** Sorteia uma cidade/estado real do Brasil, com sufixo único pra evitar colisão no banco. */
export function gerarCidadeAleatoria() {
  const base = CIDADES_BR[Math.floor(Math.random() * CIDADES_BR.length)];
  return { nome: `${base.nome} ${Date.now()}`, estado: base.estado };
}
