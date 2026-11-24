create table if not exists adm_perfil_acesso (
  cn_perfil       bigint   not null,
  ca_modulo       text     not null,
  nu_nivel        smallint not null,
  primary key (cn_perfil, ca_modulo),
  constraint fk_adm_perfil_acesso_1
    foreign key (cn_perfil) references adm_perfil (cn_perfil)
    on delete cascade on update cascade,
  constraint ck_adm_perfil_acesso_1
    check (ca_modulo in ('GERAL', 'CADASTROS', 'ORDEM_SERVICO', 'FATURAMENTO', 'RELATORIOS', 'ADMINISTRACAO')),
  constraint ck_adm_perfil_acesso_2 check (nu_nivel in (1, 2, 3))
);

comment on column adm_perfil_acesso.cn_perfil is 'Identificador do perfil de acesso.';
comment on column adm_perfil_acesso.ca_modulo is 'Código do módulo do sistema.';
comment on column adm_perfil_acesso.nu_nivel is 'Nível de acesso ao módulo.';
