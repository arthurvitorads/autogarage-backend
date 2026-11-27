create table if not exists ord_responsavel_os (
  cn_ordem bigint not null references ord_ordem_servico (cn_ordem)
    on delete restrict on update cascade,
  cn_pessoa bigint not null references cad_pessoa (cn_pessoa)
    on delete restrict on update cascade,
  primary key (cn_ordem, cn_pessoa)
);

create index if not exists idx_ord_responsavel_os_pessoa on ord_responsavel_os (cn_pessoa);

comment on column ord_responsavel_os.cn_ordem is 'Identificador da ordem de serviço.';
comment on column ord_responsavel_os.cn_pessoa is 'Identificador do funcionário responsável.';
