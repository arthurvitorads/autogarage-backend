import type { UnidadeRepository } from '../repositories/unidade.repository.js'
import type { IManutUnidade } from '../interfaces/unidade.js'

export class UnidadeService {
  constructor(
    private readonly repository: Pick<UnidadeRepository, 'view' | 'manutInc' | 'manutAlt'>,
  ) {}

  view() {
    return this.repository.view()
  }

  manutInc(values: IManutUnidade) {
    return this.repository.manutInc(values)
  }

  manutAlt(id: number, values: IManutUnidade) {
    return this.repository.manutAlt(id, values)
  }
}
