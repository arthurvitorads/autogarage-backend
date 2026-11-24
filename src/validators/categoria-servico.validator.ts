import type { IManutCategoriaServico } from '../interfaces/categoria-servico.js'
import { DataValidator as Data } from './data.validator.js'

export class CategoriaServicoValidator {
  static parse(body: unknown): IManutCategoriaServico {
    const data = Data.object(body)

    return {
      an_descr: Data.text(data.an_descr, 'a descrição'),
    }
  }
}
