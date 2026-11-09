# Tempo de serviço, Faturamento (FAT) e Relatórios

## Aplicação no banco

Os scripts foram preparados para execução manual. Nenhum comando foi executado no banco pela implementação.

Para executar pelo editor SQL (DBeaver, pgAdmin ou outro cliente), abra `atualizar_tempo_faturamento_manual.sql`, copie todo o conteúdo e execute no banco da aplicação. Esse arquivo já reúne a atualização 003 e as três tabelas, em ordem, sem comandos exclusivos do psql.

Para a base atual, que já possui o fluxo de iniciar/finalizar/cancelar O.S., executar:

```powershell
psql -v ON_ERROR_STOP=1 -d autogarage -f db-scripts/atualizar_tempo_faturamento.sql
```

O arquivo inclui `Atualizacoes/003_tempo_item_os.sql` e as tabelas `ord_tempo_item_os`, `fat_venda` e `fat_item_venda`, em uma transação. Em clientes sem suporte a `\ir`, executar os quatro arquivos nessa ordem dentro de uma transação. O script pressupõe `Atualizacoes/002_fluxo_ordem_servico.sql` já aplicado. `instalar.sql` e `atualizar_integracoes.sql` também incluem o fluxo 002 e a nova atualização ao final.

Depois, executar `npm run build` e reiniciar o backend, além de publicar/reiniciar o frontend. A execução de `prisma generate` não modifica o banco.

## Contagem

- Ao iniciar uma O.S., os seus itens de serviço pendentes iniciam a contagem juntos. Produtos não contam tempo.
- A coluna de tempo permite pausar, retomar e concluir cada serviço. Adicionar um serviço em uma O.S. em andamento inicia sua contagem.
- O backend registra os horários em `ord_tempo_item_os`. Cada retomada abre um novo intervalo. Um índice parcial impede dois intervalos abertos para o mesmo item.
- `ord_item_os.qt_tempo_segundos` guarda a soma dos intervalos encerrados; `dt_inicio_tempo` identifica o intervalo aberto. A tela mostra a soma com o intervalo atual, referenciada pelo horário da resposta do servidor, sem enviar uma requisição por segundo.
- Fechar a página não pausa o serviço. Recarregar recupera os horários persistidos. Para interromper o trabalho, usar Pausar.
- Finalizar ou cancelar a O.S. encerra os intervalos abertos. Finalizar preserva os serviços já concluídos e conclui os demais. Cancelamentos ficam fora do relatório de serviços finalizados.
- Itens de serviço cuja contagem começou não podem ser substituídos por outro serviço/produto nem removidos, preservando o histórico. Quantidade e preço podem ser corrigidos antes do encerramento da ordem, sem reiniciar o relógio. É possível adicionar outros itens enquanto a O.S. permanece aberta/em andamento.
- Não há contagem retroativa para O.S. antigas. Em ordens já em andamento, iniciar a contagem por item; em ordens já encerradas, tempo não medido permanece sem registro. Serviços sem intervalo medido não entram na comparação de tempo.
- A medição é por item (que pode conter quantidade maior que 1), em segundos inteiros. O relatório mostra a quantidade ao lado do tempo; não representa tempo por unidade nem soma de horas exclusivas de um funcionário, pois serviços podem ocorrer em paralelo.

## Vendas

- Menu Faturamento > Vendas: consulta paginada, pesquisa, detalhes e Nova venda.
- O modal permite Venda avulsa ou Por ordem de serviço. Há também Gerar venda nos detalhes das O.S. finalizadas com pelo menos um item.
- Vendas avulsas exigem cliente ativo, um ou mais produtos/serviços ativos, quantidade positiva e preço válido. Produtos baixam estoque em transação; falta de saldo desfaz a venda e todos os débitos.
- Vendas por O.S. exigem ordem finalizada com itens e o mesmo cliente. Os itens e valores são copiados do backend, com o vínculo ao item original. Não há nova baixa de estoque, pois o fluxo atual já fez essa baixa ao incluir os itens na O.S.
- Uma restrição única permite apenas uma venda por O.S. A chave de requisição e seu hash permitem repetir uma requisição sem criar nova venda ou repetir baixa de estoque; alterar o conteúdo com a mesma chave retorna conflito.
- Cabeçalho e itens guardam dados históricos: nome, documento, contato e endereço do cliente; descrição, unidade, quantidade, preço, custo do produto no faturamento e tempo do serviço. O cabeçalho guarda origem, data do servidor, observações e usuário Firebase responsável pela gravação.
- Vendas gravadas são consultadas sem edição/exclusão neste fluxo. Não foram acrescentados recebimentos, parcelas, emissão fiscal ou cancelamento de venda.

## Relatórios

- Tempo dos serviços: período de finalização da O.S., mais longos/mais rápidos, quantidade, responsável, cliente, média, menor e maior tempo. É possível abrir os intervalos de cada item.
- Vendas por período: data da venda, origem, cliente, total, quantidade de vendas e soma do período, com acesso aos dados históricos dos itens.
- Os totais são calculados para todo o período, independentemente da página exibida. Datas da tela usam o início/fim do dia local e são enviadas com fuso à API.

## Rotas

- `POST /ordensServico/itens/tempo` recebe `cn_ordem_servico`, `cn_item` e `acao` (`INICIAR`, `PAUSAR` ou `FINALIZAR`).
- `POST /pessoa/detalhar` recebe `cn_pessoa` para consultar o cliente e o endereço.
- `POST /faturamento/vendas` cria uma venda. `POST /faturamento/vendas/listar` recebe `page`, `limit` e `search`. `POST /faturamento/vendas/detalhar` recebe `cn_venda`.
- `POST /relatorios/tempos-servicos` recebe `inicio`, `fim`, `ordem` (`asc` ou `desc`), `page` e `limit`.
- `POST /relatorios/vendas` recebe `inicio`, `fim`, `page` e `limit`.

Os parâmetros são enviados no corpo JSON. Todas as rotas seguem a autenticação e o envelope `{ sucesso, dados }` do sistema. Conflitos de concorrência retornam 409 para atualização/tentativa posterior. As chaves bigint são enviadas e retornadas como texto.

## Validação

`npm run build` em ambos os projetos e `npm test` no backend. Os testes incluem fluxo de O.S., intervalos com pausa/retomada, encerramento, validação de vendas, estoque, repetição de requisição e prevenção de faturamento duplicado. São testes com repositórios/transações simuladas; não substituem execução dos scripts e teste em PostgreSQL real.

Após aplicar no banco de desenvolvimento: iniciar uma O.S. com serviço, pausar/retomar, recarregar a tela e finalizar; gerar a venda e conferir que o estoque não muda novamente; registrar venda avulsa e conferir baixa; consultar os dois relatórios. O relatório de tempo considera o dia de finalização da ordem.
