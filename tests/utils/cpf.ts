function calcularDigitoVerificador(digitos: number[], pesoInicial: number): number {
  const soma = digitos.reduce((acc, digito, i) => acc + digito * (pesoInicial - i), 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

/** Gera um CPF válido (com dígitos verificadores corretos), formatado como 000.000.000-00. */
export function gerarCpfValido(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

  const d1 = calcularDigitoVerificador(base, 10);
  const d2 = calcularDigitoVerificador([...base, d1], 11);

  const numeros = [...base, d1, d2].join('');
  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9, 11)}`;
}
