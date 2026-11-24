import type { MarcaRepository } from '../repositories/marca.repository.js'
import type { IManutMarca } from '../interfaces/marca.js'

export class MarcaService {
  constructor(private readonly repository: Pick<MarcaRepository, 'view' | 'manutInc' | 'manutAlt'>) {}

  view() {
    return this.repository.view()
  }

  manutInc(values: IManutMarca) {
    return this.repository.manutInc(values)
  }

  manutAlt(id: number, values: IManutMarca) {
    return this.repository.manutAlt(id, values)
  }
}
