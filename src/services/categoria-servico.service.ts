import type { CategoriaServicoRepository } from '../repositories/categoria-servico.repository.js'
import type { IManutCategoriaServico } from '../interfaces/categoria-servico.js'

export class CategoriaServicoService {
  constructor(
    private readonly repository: Pick<CategoriaServicoRepository, 'view' | 'manutInc' | 'manutAlt'>,
  ) {}

  view() {
    return this.repository.view()
  }

  manutInc(values: IManutCategoriaServico) {
    return this.repository.manutInc(values)
  }

  manutAlt(id: number, values: IManutCategoriaServico) {
    return this.repository.manutAlt(id, values)
  }
}
