begin;

-- A tabela de status personalizáveis passa a representar classificações.
-- Os nomes físicos são preservados para manter as referências existentes.
alter table ord_ordem_servico add column if not exists ca_status text;
alter table ord_ordem_servico add column if not exists an_motivo_cancelamento text not null default '';
alter table ord_ordem_servico add column if not exists dt_inicio timestamptz;
alter table ord_ordem_servico add column if not exists dt_finalizacao timestamptz;
alter table ord_ordem_servico add column if not exists dt_cancelamento timestamptz;

update ord_ordem_servico o set ca_status = case
  when lower(s.an_descr) ~ 'cancelad' then 'CANCELADO'
  when lower(s.an_descr) ~ '(finalizad|conclu[ií]d|encerrad|entregue)' then 'FINALIZADO'
  when lower(s.an_descr) ~ '(andamento|execu)' then 'EM_ANDAMENTO'
  else 'ABERTO'
end from ord_status_os s where s.cn_status_os = o.cn_status_os and o.ca_status is null;
update ord_ordem_servico set ca_status = 'ABERTO' where ca_status is null;
alter table ord_ordem_servico alter column ca_status set default 'ABERTO';
alter table ord_ordem_servico alter column ca_status set not null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_ord_ordem_servico_status') then
    alter table ord_ordem_servico add constraint ck_ord_ordem_servico_status
      check (ca_status in ('ABERTO', 'EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO'));
  end if;
end $$;

commit;
