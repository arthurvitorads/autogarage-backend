-- psql: executar este arquivo a partir de qualquer diretório.
-- Pressupõe as tabelas originais: adm_usuario, cad_pessoa, cad_endereco, ord_status_os.
\set ON_ERROR_STOP on
begin;
\ir Atualizacoes/001_integracoes.sql
\ir Tabelas/cad_auxiliar.sql
\ir Tabelas/cad_produto.sql
\ir Tabelas/cad_servico.sql
\ir Tabelas/ord_ordem_servico.sql
\ir Tabelas/ord_item_os.sql
commit;
