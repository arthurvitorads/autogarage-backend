import type { IManutCategoriaProduto } from '../interfaces/categoria-produto.js'
import { DataValidator as Data } from './data.validator.js'

export class CategoriaProdutoValidator {
  static parse(body: unknown): IManutCategoriaProduto {
    const data = Data.object(body)

    return {
      an_descr: Data.text(data.an_descr, 'a descrição'),
    }
  }
}
