import { test, expect } from '@playwright/test';

// Testes que só fazem sentido agora que o frontend tem URLs reais (Next.js App Router).
// Numa SPA de aba única (React+Vite antigo) não tinha URL pra afirmar nem "voltar" pra testar.

//Cenário 1 - navegar direto para uma URL, sem precisar clicar em nada antes
test('Acessar /cidades/novo direto pela URL abre o formulário', async ({ page }) => {
  await page.goto('http://localhost:5173/cidades/novo');

  await expect(page).toHaveURL('http://localhost:5173/cidades/novo');
  await expect(page.getByRole('heading', { name: 'Nova cidade' })).toBeVisible();
});

//Cenário 2 - a URL muda ao navegar para o detalhe de um animal, e "Voltar" restaura a lista
test('Ver detalhes de um animal muda a URL para /animais/:id', async ({ page, request }) => {
  // cria o próprio animal antes, pra não depender de dado já existir no banco
  // (num ambiente limpo, tipo o CI, a lista pode começar vazia)
  await request.post('http://localhost:3001/animais', {
    data: { nome: `NavTest ${Date.now()}`, especie_id: 1 },
  });

  await page.goto('http://localhost:5173/animais');

  const primeiroCard = page.locator('button[aria-label^="Ver detalhes de"]').first();
  await primeiroCard.waitFor();
  await primeiroCard.click();

  // a URL agora tem um id numérico no final, tipo /animais/42
  await expect(page).toHaveURL(/\/animais\/\d+$/);

  await page.getByRole('button', { name: '← Voltar para a lista' }).click();
  await expect(page).toHaveURL('http://localhost:5173/animais');
});

//Cenário 3 - o botão "voltar" do próprio navegador funciona, porque agora existe histórico de URL de verdade
test('Botão voltar do navegador retorna da tela de detalhe para a lista', async ({ page, request }) => {
  await request.post('http://localhost:3001/animais', {
    data: { nome: `NavTest ${Date.now()}`, especie_id: 1 },
  });

  await page.goto('http://localhost:5173/animais');

  const primeiroCard = page.locator('button[aria-label^="Ver detalhes de"]').first();
  await primeiroCard.waitFor();
  await primeiroCard.click();
  await expect(page).toHaveURL(/\/animais\/\d+$/);

  await page.goBack();
  await expect(page).toHaveURL('http://localhost:5173/animais');
  await expect(page.getByRole('heading', { name: 'Animais', exact: true })).toBeVisible();
});

//Cenário 4 - acessar um id que não existe não quebra a página, mostra mensagem de erro
test('Acessar um animal com id inexistente mostra "não encontrado"', async ({ page }) => {
  await page.goto('http://localhost:5173/animais/999999999');

  await expect(page.getByText('Animal não encontrado.')).toBeVisible();
});
