import type { IManutMarca } from '../interfaces/brand.js'
import { DataValidator as Data } from './data.validator.js'

export class BrandValidator {
  static parse(body: unknown): IManutMarca {
    const data = Data.object(body)

    return {
      an_descr: Data.text(data.an_descr, 'a descrição'),
    }
  }
}
