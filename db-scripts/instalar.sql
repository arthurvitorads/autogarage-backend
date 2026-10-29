-- Instalação nova, em banco vazio. Não utilizar em uma base já instalada.
\set ON_ERROR_STOP on
begin;
\ir Tabelas/adm_perfil.sql
\ir Tabelas/adm_usuario.sql
\ir Tabelas/cad_pessoa.sql
\ir Tabelas/cad_endereco.sql
\ir Tabelas/ord_status_os.sql
\ir Atualizacoes/001_integracoes.sql
\ir Tabelas/cad_auxiliar.sql
\ir Tabelas/cad_produto.sql
\ir Tabelas/cad_servico.sql
\ir Tabelas/ord_ordem_servico.sql
\ir Tabelas/ord_item_os.sql
commit;
