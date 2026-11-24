begin;

alter table ord_status_os
  add column if not exists ca_cor text not null default '#64748b',
  add column if not exists bo_padrao boolean not null default false;

alter table ord_ordem_servico
  add column if not exists cn_responsavel bigint references cad_pessoa (cn_pessoa)
    on delete restrict on update cascade;

alter table ord_item_os
  add column if not exists ca_status_servico text not null default 'PENDENTE',
  add column if not exists qt_tempo_segundos integer not null default 0,
  add column if not exists dt_inicio_tempo timestamptz;

create index if not exists idx_ord_ordem_servico_responsavel
  on ord_ordem_servico (cn_responsavel);

create index if not exists idx_ord_ordem_servico_placa
  on ord_ordem_servico (an_placa, dt_entrada);

create index if not exists idx_ord_item_os_4
  on ord_item_os (ca_status_servico, qt_tempo_segundos);

commit;
