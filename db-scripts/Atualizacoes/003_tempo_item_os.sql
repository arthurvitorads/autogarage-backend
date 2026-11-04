-- Campos de controle por item. Registros antigos não recebem tempo retroativo.
alter table ord_item_os add column if not exists ca_status_servico text not null default 'PENDENTE'
  check (ca_status_servico in ('PENDENTE', 'EM_ANDAMENTO', 'PAUSADO', 'FINALIZADO', 'CANCELADO'));
alter table ord_item_os add column if not exists qt_tempo_segundos integer not null default 0 check (qt_tempo_segundos >= 0);
alter table ord_item_os add column if not exists dt_inicio_tempo timestamptz;
create index if not exists idx_ord_item_os_4
  on ord_item_os (ca_status_servico, qt_tempo_segundos);
