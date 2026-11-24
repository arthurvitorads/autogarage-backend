import type { CategoriaProdutoRepository } from '../repositories/categoria-produto.repository.js'
import type { IManutCategoriaProduto } from '../interfaces/categoria-produto.js'

export class CategoriaProdutoService {
  constructor(
    private readonly repository: Pick<CategoriaProdutoRepository, 'view' | 'manutInc' | 'manutAlt'>,
  ) {}

  view() {
    return this.repository.view()
  }

  manutInc(values: IManutCategoriaProduto) {
    return this.repository.manutInc(values)
  }

  manutAlt(id: number, values: IManutCategoriaProduto) {
    return this.repository.manutAlt(id, values)
  }
}
