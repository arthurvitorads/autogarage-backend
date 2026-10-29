-- Carga fictícia para desenvolvimento. Executar após instalar.sql ou atualizar_integracoes.sql.
-- Nomes, documentos, telefones e endereços são dados sintéticos, sem vínculo com pessoas reais.
-- E-mails usam o domínio fictício garagemaurora.test e não devem receber mensagens.
-- Pode ser executado novamente: não apaga nem atualiza registros existentes.
insert into cad_auxiliar (ca_tipo, an_descr, ca_sigla)
values
  ('CATEGORIA_PRODUTO', 'Filtros', ''),
  ('CATEGORIA_PRODUTO', 'Lubrificantes', ''),
  ('CATEGORIA_PRODUTO', 'Freios', ''),
  ('CATEGORIA_PRODUTO', 'Ignição', ''),
  ('CATEGORIA_PRODUTO', 'Suspensão', ''),
  ('CATEGORIA_PRODUTO', 'Arrefecimento', ''),
  ('CATEGORIA_SERVICO', 'Manutenção preventiva', ''),
  ('CATEGORIA_SERVICO', 'Diagnóstico', ''),
  ('CATEGORIA_SERVICO', 'Freios e suspensão', ''),
  ('CATEGORIA_SERVICO', 'Motor', ''),
  ('MARCA', 'ViaTorque', ''),
  ('MARCA', 'NorteFiltro', ''),
  ('MARCA', 'LubriVento', ''),
  ('MARCA', 'FreioVale', ''),
  ('UNIDADE', 'Unidade', 'UN'),
  ('UNIDADE', 'Litro', 'L'),
  ('UNIDADE', 'Jogo', 'JG'),
  ('UNIDADE', 'Par', 'PAR')
on conflict do nothing;

insert into cad_pessoa (
  ca_tipo, an_nome, ca_cpf, ca_cnpj, an_razao_social, an_nome_fantasia,
  an_email, an_telefone, bo_categ_cliente, bo_categ_func, an_cargo,
  nm_comissao_percentual, bo_sts_reg
)
select carga.*
from (values
  ('PF', 'Marina Azevedo Duarte', '85142073002', null, null, null, 'marina.duarte@garagemaurora.test', '11900001001', true, false, '', 0, true),
  ('PF', 'Rafael Nogueira Bastos', '85142073185', null, null, null, 'rafael.bastos@garagemaurora.test', '11900001002', true, false, '', 0, true),
  ('PF', 'Camila Ribeiro Farias', '85142073266', null, null, null, 'camila.farias@garagemaurora.test', '11900001003', true, false, '', 0, true),
  ('PF', 'Diego Martins Tavares', '85142073347', null, null, null, 'diego.tavares@garagemaurora.test', '11900001004', true, true, 'Mecânico', 8.50, true),
  ('PF', 'Luana Carvalho Reis', '85142073428', null, null, null, 'luana.reis@garagemaurora.test', '11900001005', false, true, 'Consultora técnica', 3.00, true),
  ('PF', 'Bruno Ferraz Monteiro', '85142073509', null, null, null, 'bruno.monteiro@garagemaurora.test', '11900001006', false, true, 'Eletricista automotivo', 7.25, true),
  ('PF', 'Helena Castro Siqueira', '85142073690', null, null, null, 'helena.siqueira@garagemaurora.test', '11900001007', true, false, '', 0, true),
  ('PF', 'André Peixoto Valença', '85142073770', null, null, null, 'andre.valenca@garagemaurora.test', '11900001008', true, false, '', 0, false),
  ('PJ', null, null, '84739162000136', 'Transportes Serra Clara Ltda.', 'Serra Clara Transportes', 'frota.serraclara@garagemaurora.test', '1130001009', true, false, '', 0, true),
  ('PJ', null, null, '73628491000193', 'Comércio Vale do Cedro Ltda.', 'Empório Vale do Cedro', 'administracao.valecedro@garagemaurora.test', '1130001010', true, false, '', 0, true)
) as carga(ca_tipo, an_nome, ca_cpf, ca_cnpj, an_razao_social, an_nome_fantasia,
  an_email, an_telefone, bo_categ_cliente, bo_categ_func, an_cargo,
  nm_comissao_percentual, bo_sts_reg)
where not exists (
  select 1 from cad_pessoa pessoa
  where lower(pessoa.an_email) = lower(carga.an_email)
     or pessoa.ca_cpf = carga.ca_cpf or pessoa.ca_cnpj = carga.ca_cnpj
)
on conflict do nothing;

insert into cad_endereco (
  cn_pessoa, ca_cep, an_logradouro, an_numero, an_complemento,
  an_bairro, an_cidade, ca_uf, bo_sts_reg
)
select pessoa.cn_pessoa, carga.ca_cep, carga.an_logradouro, carga.an_numero,
  carga.an_complemento, carga.an_bairro, carga.an_cidade, carga.ca_uf, true
from (values
  ('marina.duarte@garagemaurora.test', '85142073002', '01001000', 'Rua das Acácias', '148', 'Casa 2', 'Jardim Aurora', 'São Paulo', 'SP'),
  ('rafael.bastos@garagemaurora.test', '85142073185', '13010000', 'Rua do Ipê Amarelo', '320', 'Apartamento 34', 'Vila Serena', 'Campinas', 'SP'),
  ('camila.farias@garagemaurora.test', '85142073266', '18010000', 'Alameda dos Jacarandás', '87', '', 'Parque das Flores', 'Sorocaba', 'SP'),
  ('diego.tavares@garagemaurora.test', '85142073347', '13201000', 'Rua Horizonte Azul', '456', 'Casa B', 'Jardim dos Lagos', 'Jundiaí', 'SP'),
  ('luana.reis@garagemaurora.test', '85142073428', '09010000', 'Rua das Magnólias', '62', '', 'Vila Harmonia', 'Santo André', 'SP'),
  ('bruno.monteiro@garagemaurora.test', '85142073509', '09710000', 'Avenida Vale Verde', '910', 'Bloco C', 'Parque dos Cedros', 'São Bernardo do Campo', 'SP'),
  ('helena.siqueira@garagemaurora.test', '85142073690', '06010000', 'Rua das Andorinhas', '235', 'Apartamento 12', 'Jardim Primavera', 'Osasco', 'SP'),
  ('andre.valenca@garagemaurora.test', '85142073770', '07010000', 'Rua Caminho do Sol', '73', '', 'Vila das Palmeiras', 'Guarulhos', 'SP'),
  ('frota.serraclara@garagemaurora.test', '84739162000136', '11010000', 'Avenida Porto Sereno', '1250', 'Galpão 3', 'Distrito Industrial', 'Santos', 'SP'),
  ('administracao.valecedro@garagemaurora.test', '73628491000193', '14010000', 'Rua do Mercado Novo', '508', 'Sala 5', 'Vila Cedro', 'Ribeirão Preto', 'SP')
) as carga(an_email, an_documento, ca_cep, an_logradouro, an_numero,
  an_complemento, an_bairro, an_cidade, ca_uf)
join cad_pessoa pessoa on pessoa.an_email = carga.an_email
  and coalesce(pessoa.ca_cpf, pessoa.ca_cnpj) = carga.an_documento
on conflict (cn_pessoa) do nothing;

insert into cad_produto (
  an_nome, an_referencia, an_categoria, an_marca, ca_unidade,
  vl_custo, vl_venda, qt_estoque, qt_estoque_min, an_obs, bo_sts_reg
)
values
  ('Filtro de óleo para motor 1.0/1.6', 'NF-OL-101', 'Filtros', 'NorteFiltro', 'UN', 18.90, 34.90, 35, 8, 'Conferir aplicação pelo modelo do veículo.', true),
  ('Filtro de ar do motor', 'NF-AR-220', 'Filtros', 'NorteFiltro', 'UN', 26.50, 49.90, 18, 5, '', true),
  ('Filtro de cabine com carvão ativado', 'NF-CB-330', 'Filtros', 'NorteFiltro', 'UN', 32.00, 64.90, 4, 6, 'Saldo abaixo do mínimo para testar o indicador da grid.', true),
  ('Óleo sintético 5W30', 'LV-5W30-01', 'Lubrificantes', 'LubriVento', 'L', 29.80, 48.90, 80.500, 20, 'Venda fracionada por litro.', true),
  ('Óleo sintético 0W20', 'LV-0W20-02', 'Lubrificantes', 'LubriVento', 'L', 36.00, 59.90, 32.750, 12, 'Conferir especificação do fabricante.', true),
  ('Fluido de freio DOT 4', 'FV-DOT4-05', 'Freios', 'FreioVale', 'L', 31.00, 54.90, 12.500, 4, '', true),
  ('Jogo de pastilhas de freio dianteiro', 'FV-PA-410', 'Freios', 'FreioVale', 'JG', 85.00, 149.90, 10, 3, '', true),
  ('Par de discos de freio ventilados', 'FV-DS-420', 'Freios', 'FreioVale', 'PAR', 190.00, 319.90, 5, 2, '', true),
  ('Jogo de velas de ignição', 'VT-VL-510', 'Ignição', 'ViaTorque', 'JG', 64.00, 119.90, 14, 4, '', true),
  ('Amortecedor dianteiro', 'VT-AM-610', 'Suspensão', 'ViaTorque', 'UN', 215.00, 359.90, 0, 2, 'Sem saldo para testar a recusa de item na ordem.', true),
  ('Aditivo de arrefecimento pronto para uso', 'LV-AD-710', 'Arrefecimento', 'LubriVento', 'L', 15.50, 29.90, 42.250, 10, '', true),
  ('Filtro de combustível linha anterior', 'NF-CB-090', 'Filtros', 'NorteFiltro', 'UN', 19.00, 36.90, 3, 1, 'Item inativo para validar os filtros de seleção.', false)
on conflict do nothing;

insert into cad_servico (an_nome, an_categoria, vl_preco, nu_tempo_estimado, an_obs, bo_sts_reg)
select carga.an_nome, carga.an_categoria, carga.vl_preco, carga.nu_tempo_estimado, carga.an_obs, carga.bo_sts_reg
from (values
  ('Troca de óleo e filtro', 'Manutenção preventiva', 65.00, 40, 'Mão de obra; materiais adicionados separadamente na ordem.', true),
  ('Revisão preventiva de 10 mil km', 'Manutenção preventiva', 240.00, 120, 'Inspeção de fluidos, filtros, freios e suspensão.', true),
  ('Diagnóstico eletrônico com scanner', 'Diagnóstico', 120.00, 45, 'Leitura de falhas e relatório técnico.', true),
  ('Substituição de pastilhas de freio', 'Freios e suspensão', 110.00, 60, 'Mão de obra por eixo.', true),
  ('Substituição de amortecedores dianteiros', 'Freios e suspensão', 260.00, 150, 'Mão de obra para o par dianteiro.', true),
  ('Limpeza do sistema de arrefecimento', 'Motor', 180.00, 90, 'Fluido e aditivo cobrados separadamente.', true),
  ('Substituição de velas de ignição', 'Motor', 85.00, 45, '', true),
  ('Regulagem de carburador', 'Motor', 150.00, 90, 'Serviço fora do catálogo ativo.', false)
) as carga(an_nome, an_categoria, vl_preco, nu_tempo_estimado, an_obs, bo_sts_reg)
where not exists (
  select 1 from cad_servico servico where lower(btrim(servico.an_nome)) = lower(btrim(carga.an_nome))
);
