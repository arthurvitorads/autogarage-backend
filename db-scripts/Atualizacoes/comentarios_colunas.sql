-- Execute depois de criar as tabelas e aplicar as atualizações de colunas.
begin;

comment on column adm_perfil.cn_perfil is 'Identificador do perfil de acesso.';
comment on column adm_perfil.an_descr is 'Descrição do registro.';
comment on column adm_perfil.bo_sts_reg is 'Indica se o registro está ativo.';
comment on column adm_perfil.dt_inc is 'Data e hora de inclusão.';
comment on column adm_perfil.dt_alt is 'Data e hora da última alteração.';

comment on column adm_perfil_acesso.cn_perfil is 'Identificador do perfil de acesso.';
comment on column adm_perfil_acesso.ca_modulo is 'Código do módulo do sistema.';
comment on column adm_perfil_acesso.nu_nivel is 'Nível de acesso ao módulo.';

comment on column adm_usuario.cn_usuario is 'Identificador do usuário.';
comment on column adm_usuario.ca_id_firebase is 'Identificador do usuário no Firebase Authentication.';
comment on column adm_usuario.an_email is 'Endereço de e-mail.';
comment on column adm_usuario.an_nome is 'Nome do usuário.';
comment on column adm_usuario.cn_perfil is 'Identificador do perfil de acesso.';
comment on column adm_usuario.bo_sts_reg is 'Indica se o registro está ativo.';
comment on column adm_usuario.dt_inc is 'Data e hora de inclusão.';
comment on column adm_usuario.dt_alt is 'Data e hora da última alteração.';

comment on column cad_categoria_produto.cn_categoria_produto is 'Identificador da categoria do produto.';
comment on column cad_categoria_produto.an_descr is 'Descrição do registro.';
comment on column cad_categoria_produto.dt_inc is 'Data e hora de inclusão.';
comment on column cad_categoria_produto.dt_alt is 'Data e hora da última alteração.';

comment on column cad_categoria_servico.cn_categoria_servico is 'Identificador da categoria do serviço.';
comment on column cad_categoria_servico.an_descr is 'Descrição do registro.';
comment on column cad_categoria_servico.dt_inc is 'Data e hora de inclusão.';
comment on column cad_categoria_servico.dt_alt is 'Data e hora da última alteração.';

comment on column cad_endereco.cn_endereco is 'Identificador do endereço.';
comment on column cad_endereco.cn_pessoa is 'Identificador da pessoa.';
comment on column cad_endereco.ca_cep is 'Código de endereçamento postal.';
comment on column cad_endereco.an_logradouro is 'Nome do logradouro.';
comment on column cad_endereco.an_numero is 'Número textual do endereço.';
comment on column cad_endereco.an_complemento is 'Complemento do endereço.';
comment on column cad_endereco.an_bairro is 'Bairro.';
comment on column cad_endereco.an_cidade is 'Município.';
comment on column cad_endereco.cn_estado is 'Identificador do estado.';
comment on column cad_endereco.bo_sts_reg is 'Indica se o registro está ativo.';
comment on column cad_endereco.dt_inc is 'Data e hora de inclusão.';
comment on column cad_endereco.dt_alt is 'Data e hora da última alteração.';

comment on column cad_marca.cn_marca is 'Identificador da marca.';
comment on column cad_marca.an_descr is 'Descrição do registro.';
comment on column cad_marca.dt_inc is 'Data e hora de inclusão.';
comment on column cad_marca.dt_alt is 'Data e hora da última alteração.';

comment on column cad_pessoa.cn_pessoa is 'Identificador da pessoa.';
comment on column cad_pessoa.ca_tipo is 'PF para pessoa física ou PJ para pessoa jurídica.';
comment on column cad_pessoa.an_nome is 'Nome da pessoa física.';
comment on column cad_pessoa.ca_cpf is 'CPF da pessoa física.';
comment on column cad_pessoa.ca_cnpj is 'CNPJ da pessoa jurídica.';
comment on column cad_pessoa.an_razao_social is 'Razão social.';
comment on column cad_pessoa.an_nome_fantasia is 'Nome fantasia.';
comment on column cad_pessoa.an_email is 'Endereço de e-mail.';
comment on column cad_pessoa.an_telefone is 'Telefone com DDD.';
comment on column cad_pessoa.bo_categ_cliente is 'Indica se a pessoa está cadastrada como cliente.';
comment on column cad_pessoa.bo_categ_func is 'Indica se a pessoa está cadastrada como funcionário.';
comment on column cad_pessoa.an_cargo is 'Cargo do funcionário.';
comment on column cad_pessoa.nm_comissao_func is 'Percentual de comissão do funcionário.';
comment on column cad_pessoa.bo_sts_reg is 'Indica se o registro está ativo.';
comment on column cad_pessoa.dt_inc is 'Data e hora de inclusão.';
comment on column cad_pessoa.dt_alt is 'Data e hora da última alteração.';

comment on column cad_produto.cn_produto is 'Identificador do produto.';
comment on column cad_produto.an_nome is 'Nome do produto.';
comment on column cad_produto.an_referencia is 'Referência comercial do produto.';
comment on column cad_produto.an_categoria is 'Descrição da categoria no catálogo.';
comment on column cad_produto.an_marca is 'Marca.';
comment on column cad_produto.ca_unidade is 'Sigla da unidade de medida.';
comment on column cad_produto.vl_custo is 'Custo unitário.';
comment on column cad_produto.vl_venda is 'Preço unitário de venda.';
comment on column cad_produto.qt_estoque is 'Quantidade em estoque.';
comment on column cad_produto.qt_estoque_min is 'Quantidade mínima de estoque.';
comment on column cad_produto.an_obs is 'Observações.';
comment on column cad_produto.bo_sts_reg is 'Indica se o registro está ativo.';
comment on column cad_produto.dt_inc is 'Data e hora de inclusão.';
comment on column cad_produto.dt_alt is 'Data e hora da última alteração.';

comment on column cad_servico.cn_servico is 'Identificador do serviço.';
comment on column cad_servico.an_nome is 'Nome do serviço.';
comment on column cad_servico.an_categoria is 'Descrição da categoria no catálogo.';
comment on column cad_servico.vl_preco is 'Preço de referência do serviço.';
comment on column cad_servico.nu_tempo_estimado is 'Tempo estimado do serviço em minutos.';
comment on column cad_servico.an_obs is 'Observações.';
comment on column cad_servico.bo_sts_reg is 'Indica se o registro está ativo.';
comment on column cad_servico.dt_inc is 'Data e hora de inclusão.';
comment on column cad_servico.dt_alt is 'Data e hora da última alteração.';

comment on column cad_unidade.cn_unidade is 'Identificador da unidade de medida.';
comment on column cad_unidade.an_descr is 'Descrição do registro.';
comment on column cad_unidade.ca_sigla is 'Sigla da unidade de medida.';
comment on column cad_unidade.dt_inc is 'Data e hora de inclusão.';
comment on column cad_unidade.dt_alt is 'Data e hora da última alteração.';

comment on column end_estados.cn_estado is 'Identificador do estado.';
comment on column end_estados.an_descr is 'Descrição do registro.';
comment on column end_estados.ca_uf is 'Sigla da unidade federativa.';
comment on column end_estados.ca_pais is 'Código do país com dois caracteres.';
comment on column end_estados.dt_inc is 'Data e hora de inclusão.';
comment on column end_estados.dt_alt is 'Data e hora da última alteração.';

comment on column fat_item_venda.cn_item_venda is 'Identificador do item da venda.';
comment on column fat_item_venda.cn_venda is 'Identificador da venda.';
comment on column fat_item_venda.cn_item_os is 'Identificador do item da ordem que originou o faturamento.';
comment on column fat_item_venda.ca_tipo is 'Tipo do item faturado, PRODUTO ou SERVICO.';
comment on column fat_item_venda.cn_produto is 'Identificador do produto.';
comment on column fat_item_venda.cn_servico is 'Identificador do serviço.';
comment on column fat_item_venda.an_descr is 'Descrição do registro.';
comment on column fat_item_venda.ca_unidade is 'Sigla da unidade de medida.';
comment on column fat_item_venda.qt_quantidade is 'Quantidade do item.';
comment on column fat_item_venda.vl_unitario is 'Preço unitário aplicado ao item.';
comment on column fat_item_venda.vl_custo is 'Custo unitário.';
comment on column fat_item_venda.vl_total is 'Valor total.';
comment on column fat_item_venda.qt_tempo_segundos is 'Tempo acumulado de execução em segundos.';
comment on column fat_item_venda.dt_inc is 'Data e hora de inclusão.';
comment on column fat_item_venda.dt_alt is 'Data e hora da última alteração.';

comment on column fat_venda.cn_venda is 'Identificador da venda.';
comment on column fat_venda.nu_numero is 'Número sequencial exibido ao usuário.';
comment on column fat_venda.cn_pessoa is 'Identificador da pessoa.';
comment on column fat_venda.cn_ordem_servico is 'Identificador da ordem de serviço.';
comment on column fat_venda.ca_chave_requisicao is 'Chave de idempotência da solicitação de venda.';
comment on column fat_venda.ca_hash_requisicao is 'Hash dos dados da solicitação de venda.';
comment on column fat_venda.ca_origem is 'Origem da venda, direta ou por ordem de serviço.';
comment on column fat_venda.an_cliente is 'Nome ou razão social registrado na venda.';
comment on column fat_venda.ca_documento is 'CPF ou CNPJ registrado na venda.';
comment on column fat_venda.an_email is 'E-mail do cliente registrado na venda.';
comment on column fat_venda.an_telefone is 'Telefone do cliente registrado na venda.';
comment on column fat_venda.an_endereco is 'Endereço do cliente registrado na venda.';
comment on column fat_venda.an_obs is 'Observações.';
comment on column fat_venda.ca_id_firebase is 'Identificador Firebase do usuário que registrou a venda.';
comment on column fat_venda.dt_venda is 'Data e hora da venda.';
comment on column fat_venda.vl_total is 'Valor total da venda.';
comment on column fat_venda.dt_inc is 'Data e hora de inclusão.';
comment on column fat_venda.dt_alt is 'Data e hora da última alteração.';

comment on column ord_evidencia_os.cn_evidencia is 'Identificador da evidência da ordem.';
comment on column ord_evidencia_os.cn_ordem_servico is 'Identificador da ordem de serviço.';
comment on column ord_evidencia_os.an_nome is 'Nome original do arquivo da evidência.';
comment on column ord_evidencia_os.ca_mime is 'Tipo MIME da imagem de evidência.';
comment on column ord_evidencia_os.bl_imagem is 'Conteúdo binário da imagem de evidência.';
comment on column ord_evidencia_os.dt_inc is 'Data e hora de inclusão.';

comment on column ord_item_os.cn_item is 'Identificador do item da ordem de serviço.';
comment on column ord_item_os.cn_ordem_servico is 'Identificador da ordem de serviço.';
comment on column ord_item_os.ca_tipo is 'Tipo do item da ordem, PRODUTO ou SERVICO.';
comment on column ord_item_os.cn_produto is 'Identificador do produto.';
comment on column ord_item_os.cn_servico is 'Identificador do serviço.';
comment on column ord_item_os.an_descr is 'Descrição do registro.';
comment on column ord_item_os.ca_unidade is 'Sigla da unidade de medida.';
comment on column ord_item_os.qt_quantidade is 'Quantidade do item.';
comment on column ord_item_os.vl_unitario is 'Preço unitário aplicado ao item.';
comment on column ord_item_os.vl_total is 'Valor total.';
comment on column ord_item_os.dt_inc is 'Data e hora de inclusão.';
comment on column ord_item_os.dt_alt is 'Data e hora da última alteração.';
comment on column ord_item_os.ca_status_servico is 'Situação da execução do serviço.';
comment on column ord_item_os.qt_tempo_segundos is 'Tempo acumulado de execução em segundos.';
comment on column ord_item_os.dt_inicio_tempo is 'Início do intervalo de execução aberto.';

comment on column ord_ordem_servico.cn_ordem_servico is 'Identificador da ordem de serviço.';
comment on column ord_ordem_servico.nu_numero is 'Número sequencial exibido ao usuário.';
comment on column ord_ordem_servico.cn_pessoa is 'Identificador da pessoa.';
comment on column ord_ordem_servico.cn_status_os is 'Identificador da classificação da ordem de serviço, mapeado para cn_classificacao_os no Prisma.';
comment on column ord_ordem_servico.ca_status is 'Situação operacional da ordem de serviço.';
comment on column ord_ordem_servico.an_motivo_cancelamento is 'Motivo de cancelamento da ordem.';
comment on column ord_ordem_servico.dt_inicio is 'Data e hora de início.';
comment on column ord_ordem_servico.dt_finalizacao is 'Data e hora de finalização da ordem.';
comment on column ord_ordem_servico.dt_cancelamento is 'Data e hora de cancelamento da ordem.';
comment on column ord_ordem_servico.dt_entrada is 'Data e hora de entrada do veículo.';
comment on column ord_ordem_servico.dt_previsao is 'Previsão de entrega do veículo.';
comment on column ord_ordem_servico.an_responsavel is 'Nome do responsável registrado na ordem.';
comment on column ord_ordem_servico.cn_responsavel is 'Identificador da pessoa responsável pela ordem.';
comment on column ord_ordem_servico.an_placa is 'Placa do veículo sem separadores.';
comment on column ord_ordem_servico.an_marca is 'Marca do veículo.';
comment on column ord_ordem_servico.an_modelo is 'Modelo do veículo.';
comment on column ord_ordem_servico.nu_ano is 'Ano do veículo.';
comment on column ord_ordem_servico.an_cor is 'Cor do veículo.';
comment on column ord_ordem_servico.qt_quilometragem is 'Quilometragem informada do veículo.';
comment on column ord_ordem_servico.an_solicitacao is 'Solicitação do cliente.';
comment on column ord_ordem_servico.an_obs is 'Observações.';
comment on column ord_ordem_servico.dt_inc is 'Data e hora de inclusão.';
comment on column ord_ordem_servico.dt_alt is 'Data e hora da última alteração.';

comment on column ord_status_os.cn_status_os is 'Identificador da classificação da ordem de serviço, mapeado para cn_classificacao_os no Prisma.';
comment on column ord_status_os.an_descr is 'Descrição do registro.';
comment on column ord_status_os.ca_cor is 'Cor hexadecimal da classificação.';
comment on column ord_status_os.bo_padrao is 'Indica a classificação padrão para novas ordens.';
comment on column ord_status_os.bo_sts_reg is 'Indica se o registro está ativo.';
comment on column ord_status_os.dt_inc is 'Data e hora de inclusão.';
comment on column ord_status_os.dt_alt is 'Data e hora da última alteração.';

comment on column ord_tempo_item_os.cn_tempo_item_os is 'Identificador do intervalo de execução.';
comment on column ord_tempo_item_os.cn_item is 'Identificador do item da ordem de serviço.';
comment on column ord_tempo_item_os.dt_inicio is 'Data e hora de início.';
comment on column ord_tempo_item_os.dt_fim is 'Data e hora de encerramento do intervalo.';
comment on column ord_tempo_item_os.qt_segundos is 'Duração do intervalo em segundos inteiros.';
comment on column ord_tempo_item_os.ca_encerramento is 'Ação que encerrou o intervalo de execução.';
comment on column ord_tempo_item_os.dt_inc is 'Data e hora de inclusão.';
comment on column ord_tempo_item_os.dt_alt is 'Data e hora da última alteração.';

commit;
