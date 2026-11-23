import type { IManutCategoriaProduto } from '../interfaces/product-category.js'
import { DataValidator as Data } from './data.validator.js'

export class ProductCategoryValidator {
  static parse(body: unknown): IManutCategoriaProduto {
    const data = Data.object(body)

    return {
      an_descr: Data.text(data.an_descr, 'a descrição'),
    }
  }
}
