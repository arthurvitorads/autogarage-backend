# Regras de desenvolvimento — AutoGarage

Este documento vale para o frontend e o backend. As instruções explícitas do usuário prevalecem. Antes de alterar um fluxo, consulte sua implementação completa: tela, formulário, interfaces, service, rota, validação, repository e scripts SQL.

## Referência e formatação

- O cadastro de usuários é a referência de desenvolvimento. Consulte UsuarioPage.vue, ManutUserDialog.vue, suas interfaces e UserModel no frontend; consulte o fluxo user e adm_usuario.sql no backend.
- Siga a indentação, o alinhamento, a ordem das declarações e o espaçamento do arquivo de referência. Não acrescente linhas em branco entre cada campo ou instrução.
- No TypeScript, use aspas simples e ausência de ponto e vírgula, conforme a configuração do projeto. Preserve os agrupamentos existentes.
- Não reformate arquivos inteiros para uma alteração pontual. Não altere trechos fora do escopo nem desfaça alterações do usuário.
- Preserve a nomenclatura dos arquivos e componentes existentes; não faça renomeações em massa sem necessidade.

## Nomenclatura e tipagem

- Novas variáveis, parâmetros, funções e models de formulário devem ter nomes em inglês e descritivos.
- Use camelCase para variáveis e funções, PascalCase para classes e interfaces, prefixo I para interfaces e T para aliases de tipos, seguindo os exemplos existentes.
- As interfaces que representam tabelas podem manter o nome original: IAdmUsuario, IAdmProduto, ICadPessoa, IAdmOrdemServico e IAdmVenda.
- Preserve os nomes das tabelas, colunas e propriedades dos contratos de API. Campos como cn_usuario, an_nome, bo_sts_reg, dt_inc e dt_alt não devem ser traduzidos.
- Declare os tipos de formulários, registros, respostas, eventos, referências e props. Evite any e coerções usadas apenas para esconder erros.
- Respeite o tipo real dos identificadores, inclusive bigint serializado como string. Não converta indiscriminadamente os IDs para number.
- Os textos exibidos ao usuário permanecem em português.

## Frontend: models e modais

- Centralize os valores iniciais de cada formulário em src/models/<nome>.model.ts, seguindo UserModel.createForm() e a interface IFormUser.
- Cada criação de formulário deve retornar um novo objeto, com novas listas e objetos internos quando existirem.
- Separe a interface do registro da tabela, a interface do formulário e os contratos de requisição/resposta quando houver diferenças.
- Declare as props dos modais em interfaces nomeadas. Use visible e uma propriedade tipada para o registro, como user, person, product ou order.
- Siga o fluxo de usuário: newUser limpa selectUser e abre manutUserVisible; editUser atribui o registro selecionado e abre o mesmo modal. Adapte os nomes em inglês para cada tela.
- Reinicialize o formulário na abertura conforme inclusão ou edição. Não deixe dados de uma abertura anterior em um novo cadastro.
- Mantenha o padrão existente de emissão de eventos, fechamento, atualização da listagem, mensagens e tratamento de erros.
- Use os services para acessar a API e reaproveite os componentes, stores e utilitários existentes.

## Telas e grids

- Preserve o layout e o comportamento existentes quando a tarefa for apenas de models, nomes ou tipagem.
- Não reaplique a mudança de campos ocultos para desabilitados nem a compactação geral das windows: essa alteração foi solicitada e depois revertida.
- Para status ativo/inativo, mantenha o componente compartilhado StatusField com o comportamento de SplitButton aprovado.
- Ao alterar larguras de colunas, confira o scroll horizontal e a barra inferior do grid. Aumentar uma coluna não pode tornar o restante inacessível.
- Mudanças entre pessoa física e jurídica não devem deslocar os campos a ponto de quebrar o layout.
- Preserve a ação de informação do endereço na grid de pessoas.

## Backend e integrações

- Siga a separação existente entre routes, validators, services, repositories e models. Use o fluxo de usuário como referência em cada camada.
- Valide os dados no backend e preserve autenticação, autorização e o padrão de erros existente.
- Mantenha o contrato de resposta do projeto, como { sucesso, dados }, e o padrão atual de rotas, incluindo POST para alterações onde já adotado.
- Entregue as integrações completas: uma tela de cadastro deve consultar e persistir dados pela API, sem simular sucesso ou depender de dados fixos.
- Use transações nas gravações relacionadas que precisam ocorrer juntas. Preserve as regras existentes de estoque, totais e concorrência.
- Mantenha o módulo de vendas identificado como FAT, de faturamento.
- Preserve os registros de tempo dos itens da O.S. e os dados de vendas necessários aos relatórios. Não substitua persistência por contadores apenas no navegador.

## Banco e scripts SQL

- Entregue os scripts na pasta db-scripts, nas subpastas existentes de tabelas e atualizações, conforme o tipo de alteração.
- Os scripts são executados manualmente pelo usuário. Não execute SQL, migrations ou prisma db push automaticamente.
- Ao exigir atualização de banco, informe os arquivos necessários e sua ordem de execução. Atualize a documentação dos scripts quando necessário.
- Siga a referência de adm_usuario.sql para indentação, alinhamento de colunas, constraints e índices.
- Preserve os prefixos dos módulos existentes: adm_, cad_, ord_ e fat_. Siga os prefixos de campos já utilizados: cn_, an_, ca_, bo_, dt_, qt_, vl_, nu_ e nm_.
- Preserve os padrões de chaves primárias, estrangeiras, índices, status e datas de inclusão/alteração. Não invente uma convenção diferente para cada tabela.
- Não apague ou recrie tabelas e dados existentes para aplicar uma atualização comum.
- Scripts de carga devem conter somente INSERT, sem tabelas temporárias, DDL ou comandos adicionais de preparação.
- Na carga, use pessoas, produtos e serviços fictícios com nomes plausíveis. Evite registros chamados “Exemplo”, “Teste” ou equivalentes e use e-mails fictícios, sem dados pessoais reais.

## Validação e entrega

- Verifique os pontos de chamada ao mudar props, tipos ou assinaturas, incluindo menus, rotas e telas de detalhes.
- Para alterações de código no frontend, execute npm run build para validar TypeScript e templates.
- No backend, execute o build e os testes pertinentes à alteração, usando os comandos do package.json.
- Para mudanças apenas de documentação, revise o conteúdo e os caminhos; não é necessário executar o build.
- Não afirme que uma tela ou integração com o banco foi testada se a validação foi apenas de compilação ou com dependências simuladas.
- Ao concluir, informe o que mudou, o que foi validado e quais scripts o usuário precisa executar, se houver.

