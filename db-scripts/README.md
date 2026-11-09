# Scripts de banco — PostgreSQL

Os scripts são entregues para execução manual. A aplicação não cria tabelas automaticamente.

Para a atualização de contagem por item, vendas FAT e relatórios, consulte [tempo-faturamento.md](tempo-faturamento.md). Em uma base que já possui o fluxo de O.S., execute `atualizar_tempo_faturamento.sql`.

## Base existente

Com as tabelas originais já criadas (`adm_perfil`, `adm_usuario`, `cad_pessoa`, `cad_endereco`, `ord_status_os`):

```powershell
psql -v ON_ERROR_STOP=1 -d autogarage -f db-scripts/atualizar_integracoes.sql
```

Informe a conexão por suas opções habituais do PostgreSQL. O arquivo principal inclui os scripts em ordem e executa tudo em uma transação. Não apaga registros. Se houver descrições de status duplicadas, corrija-as antes de executar: o novo índice exige nomes únicos, desconsiderando maiúsculas e espaços externos.

## Banco vazio

```powershell
psql -v ON_ERROR_STOP=1 -d autogarage -f db-scripts/instalar.sql
```

Para ferramentas que não aceitam `\ir`, execute manualmente, na ordem dos arquivos acima, os scripts incluídos. Em base existente, comece em `Atualizacoes/001_integracoes.sql`.

Após os scripts: execute `npm run build` no backend e reinicie a API. `prisma generate` atualiza o cliente, sem alterar o banco. Não é necessário executar `prisma db push`.

Se a API usa um papel diferente do proprietário das novas tabelas, conceda a esse papel acesso às tabelas e sequências conforme a configuração do seu ambiente.

## Carga de dados fictícios

Após criar/atualizar as tabelas, execute `carga_dados.sql` no seu cliente SQL ou pelo psql:

```powershell
psql -v ON_ERROR_STOP=1 -d autogarage -f db-scripts/carga_dados.sql
```

A carga inclui 10 pessoas (8 PF e 2 PJ), seus endereços, 12 produtos, 8 serviços e 18 cadastros auxiliares. Há clientes, funcionários, registros inativos, estoque fracionado, saldo abaixo do mínimo e produto sem saldo para conferir as telas e validações. Os e-mails têm nomes plausíveis no domínio fictício `garagemaurora.test`. Todos os dados pessoais são sintéticos; documentos com dígitos verificadores servem apenas para passar nas validações locais, sem vínculo declarado com pessoas reais ou garantia de consulta externa de CNPJ/CEP.

O script contém somente cinco comandos INSERT, sem tabela temporária, DDL ou controle de transação. Pode ser repetido sequencialmente e não atualiza nem apaga registros existentes. Quando houver conflito com dados já cadastrados, esses registros serão preservados e a quantidade efetivamente inserida poderá ser menor. Não cria usuários Firebase nem ordens de serviço. A carga é manual e não é executada por `instalar.sql`.

## Verificação

- Backend: `npm run build` e `npm test`.
- Frontend: `npm run build`.
- Os testes de rotas usam Fastify.inject com autenticação e repositórios simulados; os testes de estoque exercitam o repository em uma transação simulada. Eles não executam estes scripts nem validam uma conexão PostgreSQL real.
- Após aplicar os scripts: cadastrar uma pessoa PF/PJ com endereço, conferir edição e botão de informação; criar unidade, produto com estoque e serviço; cadastrar status e ordem; adicionar, editar e remover itens; recarregar o navegador e conferir persistência e saldo. Confirmar que uma quantidade acima do saldo é recusada sem alterar a ordem ou o estoque.

## Convenções e comportamento

- Tabelas: `cad_*`, `adm_*`, `ord_*`; campos `cn_`, `an_`, `ca_`, `bo_`, `dt_`, `qt_`, `vl_`, `nu_`, `nm_`, seguindo o cadastro de usuários.
- Chaves das tabelas antigas e das ordens são bigint e retornam strings na API. Catálogo usa integer, compatível com os seletores existentes.
- Rotas autenticadas por Firebase com respostas `{ sucesso, dados }`. Consultas e gravações usam POST com os dados no corpo JSON.
- Pessoa e endereço são gravados atomicamente; CPF/CNPJ têm índices únicos existentes.
- Ao inserir produto em uma ordem, o estoque é debitado. Editar um item estorna a quantidade anterior e aplica a nova; remover estorna o saldo. Sem estoque suficiente a transação inteira é desfeita. Serviços não alteram estoque. Não há nova baixa por mudança de status.
- As transações de itens usam isolamento serializable; conflito concorrente retorna 409 e solicita nova tentativa. Descrição, unidade e preço do item ficam registrados na ordem; o total é calculado no backend com Decimal.
- Cadastro de produto permite informar o saldo atual. Não há livro de movimentações de estoque neste escopo.
- A aplicação não inclui status ou unidades fictícias: cadastre-os pelas telas antes de registrar ordens/produtos.

## Rotas POST

| Cadastro | Consultar | Criar | Alterar | Identificador no corpo |
| --- | --- | --- | --- | --- |
| Usuários | `/usuarios/listar` | `/usuarios` | `/usuarios/atualizar` | `cn_usuario` |
| Perfis | `/perfil/listar`, `/paramPerfil` | `/perfil` | `/perfil/atualizar` | `cn_perfil` |
| Pessoa | `/pessoa/listar`, `/pessoa/detalhar` | `/pessoa` | `/pessoa/atualizar` | `cn_pessoa` |
| Clientes ativos | `/paramPessoa` | — | — | — |
| Produtos | `/produtos/listar` | `/produtos` | `/produtos/atualizar` | `cn_produto` |
| Serviços | `/servicos/listar` | `/servicos` | `/servicos/atualizar` | `cn_servico` |
| Auxiliares | `/cadastrosAuxiliares/listar` | `/cadastrosAuxiliares` | `/cadastrosAuxiliares/atualizar` | `cn_cadastro` |
| Classificações de O.S. | `/classificacoesOrdens/listar`, `/ordemClassificacao` | `/classificacoesOrdens` | `/classificacoesOrdens/atualizar` | `cn_classificacao` |
| Ordens | `/ordensServico/listar`, `/ordensServico/detalhar` | `/ordensServico` | `/ordensServico/atualizar` | `cn_ordem_servico` |
| Itens | Incluídos na ordem | `/ordensServico/itens` | `/ordensServico/itens/atualizar` | `cn_ordem_servico` e, ao alterar, `cn_item` |

A sessão é consultada em `POST /auth/me` sem corpo. Para movimentar uma O.S., envie `cn_ordem_servico`, `acao` e o motivo quando exigido para `POST /ordensServico/movimentar`. Para remover um item, envie `cn_ordem_servico` e `cn_item` para `POST /ordensServico/itens/remover`.

Listas paginadas aceitam `page`, `limit` (até 100) e `search` no corpo. A listagem de ordens também aceita `status`, `classificacao`, `inicio` e `fim`. Envie identificadores bigint como texto para preservar a precisão.
