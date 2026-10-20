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

- `npm run build`: gera o Prisma Client e compila TypeScript.
- `npm start`: executa o backend compilado.
- `npm test`: compila e executa testes HTTP com Fastify inject, repository e Firebase em memória. Não acessa banco ou Firebase reais.

Para adicionar um recurso, implemente os contratos/validações, repository, serviço e controller; registre as rotas pelo `ApiRouter` e componha as dependências em `index.ts`.
