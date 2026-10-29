import type { IManutProduto, IManutServico, IManutCadastroAuxiliar } from '../interfaces/catalog.js'
import { ApiError } from '../interfaces/error.js'
import { DataValidator as Data } from './data.validator.js'

export class CatalogValidator {
  static product(body: unknown): IManutProduto {
    const data = Data.object(body)

    return {
      an_nome: Data.text(data.an_nome, 'o nome'),
      an_referencia: Data.text(data.an_referencia, 'a referência', false),
      an_categoria: Data.text(data.an_categoria, 'a categoria', false),
      an_marca: Data.text(data.an_marca, 'a marca', false),
      ca_unidade: Data.text(data.ca_unidade, 'a unidade').toUpperCase(),
      vl_custo: Data.decimal(data.vl_custo, 'o custo'),
      vl_venda: Data.decimal(data.vl_venda, 'o preço de venda'),
      qt_estoque: Data.decimal(data.qt_estoque, 'o estoque', 3, 999999999.999),
      qt_estoque_min: Data.decimal(data.qt_estoque_min, 'o estoque mínimo', 3, 999999999.999),
      an_obs: Data.text(data.an_obs, 'a observação', false),
      bo_sts_reg: Data.boolean(data.bo_sts_reg),
    }
  }

  static service(body: unknown): IManutServico {
    const data = Data.object(body)

    return {
      an_nome: Data.text(data.an_nome, 'o nome'),
      an_categoria: Data.text(data.an_categoria, 'a categoria', false),
      vl_preco: Data.decimal(data.vl_preco, 'o preço'),
      nu_tempo_estimado: Data.integer(data.nu_tempo_estimado, 'o tempo estimado', 1, 999999),
      an_obs: Data.text(data.an_obs, 'a observação', false),
      bo_sts_reg: Data.boolean(data.bo_sts_reg),
    }
  }

  static auxiliary(body: unknown): IManutCadastroAuxiliar {
    const data = Data.object(body)
    const tipo = Data.text(data.ca_tipo, 'o tipo') as IManutCadastroAuxiliar['ca_tipo']

    if (!['CATEGORIA_PRODUTO', 'CATEGORIA_SERVICO', 'MARCA', 'UNIDADE'].includes(tipo))

      throw new ApiError(400, 'Tipo de cadastro inválido.')

    const sigla = tipo === 'UNIDADE' ? Data.text(data.ca_sigla, 'a sigla').toUpperCase() : ''

    if (tipo === 'UNIDADE' && !/^[A-Z0-9]{1,10}$/.test(sigla))

      throw new ApiError(400, 'Sigla inválida.')

    return {
      ca_tipo: tipo,
      an_descr: Data.text(data.an_descr, 'a descrição'),
      ca_sigla: sigla
    }
  }
}
