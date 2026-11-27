import type { IManutServico } from '../interfaces/servico.js'
import { DataValidator as Data } from './data.validator.js'

export class ServicoValidator {
  static parse(body: unknown): IManutServico {
    const data = Data.object(body)

    return {
      an_nome: Data.text(data.an_nome, 'o nome'),
      an_categoria: Data.text(data.an_categoria, 'a categoria', false),
      vl_preco: Data.decimal(data.vl_preco, 'o preço'),
      an_obs: Data.text(data.an_obs, 'a observação', false),
      bo_sts_reg: Data.boolean(data.bo_sts_reg),
    }
  }
}
