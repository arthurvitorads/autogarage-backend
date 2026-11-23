import type { IManutProduto } from '../interfaces/product.js'
import { DataValidator as Data } from './data.validator.js'

export class ProductValidator {
  static parse(body: unknown): IManutProduto {
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
}
