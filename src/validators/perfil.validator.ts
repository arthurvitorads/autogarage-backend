import type { IManutPerfil } from '../interfaces/perfil.js'
import { DataValidator } from './data.validator.js'

export class PerfilValidator {
  static parse(body: unknown): IManutPerfil {
    const data = DataValidator.object(body)
    return {
      an_descr: DataValidator.text(data.an_descr, 'a descrição'),
      bo_sts_reg: DataValidator.boolean(data.bo_sts_reg),
    }
  }
}
