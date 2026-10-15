# AutoGarage Backend

API Fastify em TypeScript, organizada em classes com MVC e camadas de serviço e persistência. A representação de saída é JSON; a interface visual fica no projeto frontend.

## Estrutura

```text
src/
  index.ts          Composição das dependências e inicialização do servidor
  app.ts            Configuração do Fastify e registro das rotas
  routes/           Métodos HTTP, URLs e vínculo com controllers
  controllers/      Entrada HTTP, validação e chamada dos serviços
  validators/       Validação de dados recebidos
  services/         Regras de negócio e integração com Firebase
  repositories/     Consultas e gravações com Prisma
  models/           Representação de usuários e serialização dos identificadores
  http/             Padronização de rotas, respostas e erros
  middlewares/      Autenticação das requisições
  interfaces/       Contratos de entrada e erros da aplicação
  types/            Extensões dos tipos do Fastify
  prisma.ts         Configuração da conexão com o banco
  firebase-admin.ts Configuração do Firebase Admin
```

Fluxo: `rota → autenticação → controller → validação → serviço → repository/Firebase → modelo → resposta JSON`.

Os serviços recebem repository e Firebase por injeção no construtor. Eles não dependem de requests ou replies do Fastify. Controllers usam métodos vinculados à instância para preservar `this` nos handlers.

## API

Todos os endpoints exigem `Authorization: Bearer <token Firebase>`.

| Método | Endpoint | Resultado |
| --- | --- | --- |
| GET | `/auth/me` | Dados do usuário autenticado |
| GET | `/usuarios?page=1&limit=20&search=nome` | Usuários paginados |
| POST | `/usuarios` | Criação no Firebase e banco, HTTP 201 |
| POST | `/usuarios/:id` | Atualização de nome e status, HTTP 200 |

Criação aceita `an_nome`, `an_email`, `ca_senha` e `bo_sts_reg`. Atualização aceita exclusivamente `an_nome` e `bo_sts_reg`. IDs são retornados como strings para preservar a precisão de bigint. Perfil ainda não é persistido.

Respostas de sucesso: `{ sucesso: true, dados: ... }`.
Respostas de erro: `{ sucesso: false, code: 400, erro: "..." }`.
Erros previstos usam `ApiError`. Erros inesperados são registrados no servidor e retornam mensagem genérica. Autenticação e erros HTTP usam o mesmo envelope.

Se o banco falhar após criar no Firebase, o serviço exclui o usuário criado. Se falhar após atualizar o Firebase, restaura os valores anteriores. Falhas na compensação são registradas para correção operacional; Firebase e PostgreSQL não compartilham uma transação atômica.

A autenticação existente foi preservada. Regras de autorização por perfil ainda não estão implementadas.

## Execução e testes

Configure as variáveis de `.env.example`, instale as dependências e execute `npm run dev`.

- `npm run build`: gera o Prisma Client e compila TypeScript.
- `npm start`: executa o backend compilado.
- `npm test`: compila e executa testes HTTP com Fastify inject, repository e Firebase em memória. Não acessa banco ou Firebase reais.

Para adicionar um recurso, implemente os contratos/validações, repository, serviço e controller; registre as rotas pelo `ApiRouter` e componha as dependências em `index.ts`.
