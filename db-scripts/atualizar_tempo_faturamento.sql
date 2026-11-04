-- Pré-requisito: tabelas das integrações e Atualizacoes/002_fluxo_ordem_servico.sql.
\set ON_ERROR_STOP on
begin;
\ir Atualizacoes/003_tempo_item_os.sql
\ir Tabelas/ord_tempo_item_os.sql
\ir Tabelas/fat_venda.sql
\ir Tabelas/fat_item_venda.sql
commit;
