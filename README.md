# Sistema de Adoção de Animais

CRUD simples para prática de QA (testes de API, UI e banco de dados).

- **Backend**: Node.js + Express (API REST) — SQL puro via `mysql2`
- **Frontend**: React + Vite
- **Banco**: MariaDB em container Docker

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
| GET    | `/animais`                | Lista animais (filtros `?status=`, `?especie_id=`, `?cidade_id=`) |
| GET    | `/animais/:id`             | Detalhe de um animal                   |
| POST   | `/animais`                 | Cria um animal                         |
| PUT    | `/animais/:id`              | Atualiza um animal                     |
| DELETE | `/animais/:id`              | Remove um animal                       |
| POST   | `/animais/:id/adotar`         | Marca animal como adotado              |
| GET    | `/adotantes`               | Lista adotantes                        |
| GET    | `/adotantes/:id`            | Detalhe de um adotante                 |
| POST   | `/adotantes`                | Cria um adotante                       |
| GET    | `/cidades`                  | Lista cidades                          |
| POST   | `/cidades`                  | Cria uma cidade                        |
| GET    | `/especies`                 | Lista espécies                         |
| POST   | `/especies`                 | Cria uma espécie                       |
| GET    | `/racas`                    | Lista raças (filtro `?especie_id=`)    |
| POST   | `/racas`                    | Cria uma raça vinculada a uma espécie  |

### Campos de `animais`

- `especie_id`: obrigatório, referencia uma espécie cadastrada (FK)
- `raca_id`: opcional, referencia uma raça cadastrada — precisa pertencer à `especie_id` informada (senão retorna 400)
- `data_nascimento`: data (opcional, não pode ser futura). A API retorna também um campo `idade` calculado automaticamente a partir dela (em anos) — exibido na listagem do frontend.
- `cidade_id`: opcional, referencia uma cidade cadastrada (FK com `ON DELETE SET NULL`)

### Campos de `adotantes`

- `cidade_id`: opcional, mesma referência à tabela `cidades`

### Campos de `cidades`

- `nome`: obrigatório
- `estado`: sigla UF com 2 letras (normalizada para maiúsculo), obrigatório. Combinação `nome`+`estado` é única (retorna 409 se duplicada).

### Campos de `especies`

- `nome`: obrigatório e único (retorna 409 se duplicado)

### Campos de `racas`

- `nome`: obrigatório
- `especie_id`: obrigatório, referencia uma espécie cadastrada. Combinação `nome`+`especie_id` é única (retorna 409 se duplicada).

## Resetar os dados

```bash
docker compose down -v
docker compose up -d
```

O `-v` remove o volume do banco, recriando as tabelas do zero.
