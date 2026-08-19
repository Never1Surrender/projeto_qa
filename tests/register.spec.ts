import { test, expect } from '@playwright/test';
import { fakerPT_BR as faker } from '@faker-js/faker';
import { gerarCpfValido } from './utils/cpf';
import { gerarCidadeAleatoria } from './utils/cidade';

const nomeAnimal = `Bailey ${Date.now()}`;

//Cenário 1 cadastro de animal para adoção 
test('Cadastrar um animal para a adoção', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  await page.getByRole('button', { name: 'Animais', exact: true }).click();
  await page.getByRole('button', { name: '+ Novo animal' }).click();
  await page.getByRole('textbox', { name: 'Nome *' }).click();
  await page.getByRole('textbox', { name: 'Nome *' }).fill(nomeAnimal);
  await page.getByLabel('Espécie *').fill('Cachorro');
  await page.getByLabel('Raça').fill('Poodle');
  await page.getByRole('textbox', { name: 'Data de nascimento' }).fill('2023-08-24');
  await page.getByLabel('Estado').fill('SP');
  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page.getByRole('status')).toContainText('Animal cadastrado com sucesso!');
  await expect(page.getByText(nomeAnimal)).toBeVisible();
});

//Cenário 2 Cadastro de Adotante
test('Cadastrar adotante', async ({ page }) => {
  const nome = faker.person.fullName();
  const cpf = gerarCpfValido();
  const ddd = faker.number.int({ min: 11, max: 99 });
  const telefone = `(${ddd}) ${faker.number.int({ min: 90000, max: 99999 })}-${faker.number.int({ min: 1000, max: 9999 })}`;
  const email = faker.internet.email({ firstName: nome.split(' ')[0] }).toLowerCase();

  await page.goto('http://localhost:5173/');

  await page.getByRole('button', { name: 'Adotantes' }).click();
  await page.getByRole('button', { name: '+ Novo adotante' }).click();
  await page.getByRole('textbox', { name: 'Nome *' }).click();
  await page.getByRole('textbox', { name: 'Nome *' }).fill(nome);
  await page.getByRole('textbox', { name: 'CPF *' }).click();
  await page.getByRole('textbox', { name: 'CPF *' }).fill(cpf);
  await page.getByRole('textbox', { name: 'Telefone' }).click();
  await page.getByRole('textbox', { name: 'Telefone' }).fill(telefone);
  await page.getByRole('textbox', { name: 'E-mail' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill(email);
  await page.getByLabel('Estado').fill('SP');
  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page.getByRole('status')).toContainText('Adotante cadastrado com sucesso!');
  await expect(page.getByText(nome).first()).toBeVisible();
});

//Cenário 3 Cadastro de cidade
test('Cadastrar uma nova cidade', async ({ page }) => {
  const { nome: nomeCidade, estado } = gerarCidadeAleatoria();

  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Cidades' }).click();
  await page.getByRole('button', { name: '+ Nova cidade' }).click();
  await page.getByLabel('Estado (UF) *').fill(estado);
  await page.getByRole('textbox', { name: 'Nome *' }).fill(nomeCidade);
  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page.getByRole('status')).toContainText('Cidade cadastrada com sucesso!');
  await expect(page.getByText(nomeCidade)).toBeVisible();
});
