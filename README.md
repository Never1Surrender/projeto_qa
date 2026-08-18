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

Isso sobe um container MariaDB na porta `3307` do host (mapeada para a `3306` interna do container — a `3306` já estava ocupada por outro serviço nesta máquina), já com as tabelas `animais` e `adotantes` criadas (script `db/init.sql`).

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
| GET    | `/animais`                | Lista animais (filtro `?status=`)      |
| GET    | `/animais/:id`             | Detalhe de um animal                   |
| POST   | `/animais`                 | Cria um animal                         |
| PUT    | `/animais/:id`              | Atualiza um animal                     |
| DELETE | `/animais/:id`              | Remove um animal                       |
| POST   | `/animais/:id/adotar`         | Marca animal como adotado              |
| GET    | `/adotantes`               | Lista adotantes                        |
| GET    | `/adotantes/:id`            | Detalhe de um adotante                 |
| POST   | `/adotantes`                | Cria um adotante                       |

### Campos de `animais`

- `especie`: um dos valores `cachorro`, `gato`, `ave`, `coelho`, `reptil`, `outro`
- `data_nascimento`: data (opcional, não pode ser futura). A API retorna também um campo `idade` calculado automaticamente a partir dela (em anos) — exibido na listagem do frontend.

## Resetar os dados

```bash
docker compose down -v
docker compose up -d
```

O `-v` remove o volume do banco, recriando as tabelas do zero.
