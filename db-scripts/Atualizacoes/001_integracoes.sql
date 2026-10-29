-- Executar em bases existentes após os scripts originais de pessoas e status.
alter table ord_status_os add column if not exists ca_cor text not null default '#64748b';
alter table ord_status_os add column if not exists bo_padrao boolean not null default false;
create unique index if not exists idx_ord_status_os_2 on ord_status_os (lower(btrim(an_descr)));
create unique index if not exists idx_ord_status_os_3 on ord_status_os (bo_padrao) where bo_padrao;
-- O perfil é opcional no contrato atual de usuários; preservar esse comportamento.
alter table adm_usuario alter column cn_perfil drop not null;
