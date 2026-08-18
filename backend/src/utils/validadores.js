function somenteDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

function cpfValido(cpf) {
  const digitos = somenteDigitos(cpf);
  if (digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false;

  for (let posicaoVerificador = 9; posicaoVerificador <= 10; posicaoVerificador++) {
    let soma = 0;
    for (let i = 0; i < posicaoVerificador; i++) {
      soma += parseInt(digitos[i], 10) * (posicaoVerificador + 1 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(digitos[posicaoVerificador], 10)) return false;
  }
  return true;
}

function telefoneValido(telefone) {
  const digitos = somenteDigitos(telefone);
  return digitos.length === 10 || digitos.length === 11;
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function nomeValido(nome, tamanhoMaximo) {
  return typeof nome === 'string' && nome.trim().length > 0 && nome.trim().length <= tamanhoMaximo;
}

function validarCamposAdotante({ nome, cpf, telefone, email }) {
  if (!nomeValido(nome, 150)) {
    return 'Nome é obrigatório (máx. 150 caracteres)';
  }
  if (!cpf || !cpfValido(cpf)) {
    return 'CPF inválido';
  }
  if (telefone && !telefoneValido(telefone)) {
    return 'Telefone inválido (use DDD + número)';
  }
  if (email && !emailValido(email)) {
    return 'E-mail inválido';
  }
  return null;
}

module.exports = {
  somenteDigitos,
  cpfValido,
  telefoneValido,
  emailValido,
  nomeValido,
  validarCamposAdotante,
};
