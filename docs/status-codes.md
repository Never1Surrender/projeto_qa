# Status codes HTTP — referência rápida

Anotações de estudo sobre os principais códigos de status HTTP, com exemplos reais da API deste projeto (`backend/src/routes/`).

O primeiro dígito do código já indica a categoria.

## 2xx — Sucesso

| Código | Nome | Significado | Exemplo no projeto |
|---|---|---|---|
| 200 | OK | Deu certo (uso geral — GET, PUT que retornam dado) | `GET /animais` |
| 201 | Created | Criou um recurso novo (POST bem-sucedido) | `POST /animais` |
| 204 | No Content | Deu certo, mas não tem nada pra devolver | `DELETE /animais/:id` |

## 4xx — Erro do cliente (o cliente mandou algo errado)

| Código | Nome | Significado | Exemplo no projeto |
|---|---|---|---|
| 400 | Bad Request | Dado mal formado ou faltando | Nome vazio, raça que não pertence à espécie |
| 401 | Unauthorized | Falta autenticação (não logou) | Não usado neste projeto (sem login) |
| 403 | Forbidden | Autenticado, mas sem permissão — ou recurso bloqueando acesso | — |
| 404 | Not Found | O recurso não existe | `especie_id` inexistente, id errado na URL |
| 409 | Conflict | Conflito com o estado atual | CPF duplicado, excluir cidade com animais vinculados |

## 5xx — Erro do servidor (a culpa é do backend)

| Código | Nome | Significado |
|---|---|---|
| 500 | Internal Server Error | Algo quebrou no código do servidor (exception não tratada) |
| 503 | Service Unavailable | Servidor fora do ar ou sobrecarregado |

## Regra prática pra QA

Se você manda um dado errado **de propósito** e recebe `500`, geralmente é **bug** — o esperado é a API responder com `400`/`404`/`409` de forma controlada, explicando o erro. Um `500` "vazando" pro cliente costuma significar que uma validação não foi tratada.

**Teste pra tentar**: mandar `especie_id` como texto (`"especie_id": "abc"`) em vez de número, e ver se a API trata direito ou quebra com 500.
