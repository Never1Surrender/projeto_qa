# Sistema de Adoção de Animais

CRUD simples para prática de QA (testes de API, UI e banco de dados).

- **Backend**: Node.js + Express (API REST) — SQL puro via `mysql2`, rodando com Bun
- **Frontend**: Next.js (App Router) + TypeScript — rotas reais por página, tudo client-side (sem Server Components de data-fetching)
- **Banco**: MariaDB em container Docker
- **Testes**: Playwright (E2E), rodando automaticamente via GitHub Actions a cada push/PR

## Como rodar

### 1. Subir o banco de dados

```bash
docker compose up -d
```

Isso sobe um container MariaDB na porta `3307` do host (mapeada para a `3306` interna do container — a `3306` já estava ocupada por outro serviço nesta máquina), já com as tabelas `cidades`, `especies`, `racas`, `animais` e `adotantes` criadas (script `db/init.sql`), com dados iniciais pré-cadastrados.

Verifique se o container está saudável:

```bash
docker ps
```

**Opcional:** popular o banco com dados de exemplo (8 animais, 8 adotantes, cidades/raças extras):

```bash
docker exec -i adocao_mariadb mariadb -u adocao_user -padocao_pass adocao_animais < db/seed.sql
```

### 2. Rodar o backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API sobe em `http://localhost:3001`.

### 3. Rodar o frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sobe em `http://localhost:5173`.

## Endpoints da API

| Método | Rota                    | Descrição                              |
|--------|--------------------------|-----------------------------------------|
| GET    | `/animais`                | Lista animais, paginada (filtros `?status=`, `?especie_id=`, `?cidade_id=`, `?busca=`; ordenação `?ordenar=nome\|idade\|criado_em`, `?direcao=asc\|desc`; paginação `?page=`, `?limit=`) |
| GET    | `/animais/:id`             | Detalhe de um animal                   |
| POST   | `/animais`                 | Cria um animal                         |
| PUT    | `/animais/:id`              | Atualiza um animal                     |
| DELETE | `/animais/:id`              | Remove um animal                       |
| POST   | `/animais/:id/adotar`         | Marca animal como adotado              |
| GET    | `/adotantes`               | Lista adotantes, paginada (`?busca=`, `?ordenar=nome\|criado_em`, `?direcao=asc\|desc`, `?page=`, `?limit=`) |
| GET    | `/adotantes/:id`            | Detalhe de um adotante                 |
| POST   | `/adotantes`                | Cria um adotante                       |
| PUT    | `/adotantes/:id`             | Atualiza um adotante                   |
| DELETE | `/adotantes/:id`             | Remove um adotante                     |
| GET    | `/cidades`                  | Lista cidades                          |
| POST   | `/cidades`                  | Cria uma cidade                        |
| PUT    | `/cidades/:id`               | Atualiza uma cidade                    |
| DELETE | `/cidades/:id`               | Remove uma cidade                      |
| GET    | `/especies`                 | Lista espécies                         |
| POST   | `/especies`                 | Cria uma espécie                       |
| PUT    | `/especies/:id`              | Atualiza uma espécie                   |
| DELETE | `/especies/:id`              | Remove uma espécie                     |
| GET    | `/racas`                    | Lista raças (filtro `?especie_id=`)    |
| POST   | `/racas`                    | Cria uma raça vinculada a uma espécie  |
| PUT    | `/racas/:id`                 | Atualiza uma raça                      |
| DELETE | `/racas/:id`                 | Remove uma raça                        |

`GET /animais` e `GET /adotantes` retornam um objeto paginado, não um array puro:
`{ dados: [...], total, pagina, totalPaginas, limite }`. Limite padrão: 12 (animais) / 15 (adotantes), máximo 100.

### Campos de `animais`

- `nome`: obrigatório, máx. 100 caracteres
- `especie_id`: obrigatório, referencia uma espécie cadastrada (FK)
- `raca_id`: opcional, referencia uma raça cadastrada — precisa pertencer à `especie_id` informada (senão retorna 400)
- `data_nascimento`: data (opcional). Não pode ser futura nem anterior a 30 anos atrás. A API retorna também um campo `idade` calculado automaticamente a partir dela (em anos).
- `cidade_id`: opcional, referencia uma cidade cadastrada (FK com `ON DELETE SET NULL`)
- `foto_url`: opcional, URL (`http`/`https`) da foto do animal, máx. 500 caracteres

### Campos de `adotantes`

- `nome`: obrigatório, máx. 150 caracteres
- `cpf`: obrigatório, único, validado com o algoritmo de dígito verificador (módulo 11) — retorna 400 se inválido, 409 se duplicado. Armazenado só com dígitos; a máscara `000.000.000-00` é aplicada no frontend.
- `telefone`: opcional, precisa ter 10 ou 11 dígitos (DDD + número) se informado. Máscara `(00) 00000-0000` aplicada no frontend.
- `email`: opcional, validado por formato (`usuario@dominio.com`)
- `cidade_id`: opcional, mesma referência à tabela `cidades`
- Exclusão bloqueada (409) se o adotante ainda tiver algum animal com status `adotado` vinculado

### Campos de `cidades`

- `nome`: obrigatório, máx. 100 caracteres
- `estado`: sigla UF com 2 letras (normalizada para maiúsculo), obrigatório — selecionada em um dropdown com os 27 estados no frontend. Combinação `nome`+`estado` é única (retorna 409 se duplicada).

### Campos de `especies`

- `nome`: obrigatório, máx. 50 caracteres, único (retorna 409 se duplicado)
- Exclusão bloqueada (409) se houver animais ou raças vinculados

### Campos de `racas`

- `nome`: obrigatório, máx. 100 caracteres
- `especie_id`: obrigatório, referencia uma espécie cadastrada. Combinação `nome`+`especie_id` é única (retorna 409 se duplicada).

## Resetar os dados

```bash
docker compose down -v
docker compose up -d
```

O `-v` remove o volume do banco, recriando as tabelas do zero.
