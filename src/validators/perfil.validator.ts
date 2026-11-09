import type { IManutPerfil } from '../interfaces/perfil.js'
import { DataValidator } from './data.validator.js'
import { modules, type TModuleAccess } from '../interfaces/access.js'
import { ApiError } from '../interfaces/error.js'

export class PerfilValidator {
  static access(body: unknown) {
    const data = DataValidator.object(body)
    const access = DataValidator.object(data.acessos)
    if (Object.keys(access).length !== modules.length)
      throw new ApiError(400, 'Informe o acesso de todos os módulos.')
    const levels: TModuleAccess = {}
    for (const module of modules) {
      const level = access[module]
      if (level !== 1 && level !== 2 && level !== 3)
        throw new ApiError(400, 'Nível de acesso inválido.')
      levels[module] = level
    }
    return { id: DataValidator.id(data.cn_perfil), levels }
  }

  static parse(body: unknown): IManutPerfil {
    const data = DataValidator.object(body)
    return {
      an_descr: DataValidator.text(data.an_descr, 'a descrição'),
      bo_sts_reg: DataValidator.boolean(data.bo_sts_reg),
    }
  }
}
