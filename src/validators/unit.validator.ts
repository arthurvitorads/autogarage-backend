import type { IManutUnidade } from '../interfaces/unit.js'
import { ApiError } from '../interfaces/error.js'
import { DataValidator as Data } from './data.validator.js'

export class UnitValidator {
  static parse(body: unknown): IManutUnidade {
    const data = Data.object(body)
    const abbreviation = Data.text(data.ca_sigla, 'a sigla').toUpperCase()
    if (!/^[A-Z0-9]{1,10}$/.test(abbreviation)) throw new ApiError(400, 'Sigla inválida.')

    return {
      an_descr: Data.text(data.an_descr, 'a descrição'),
      ca_sigla: abbreviation,
    }
  }
}
