import type { EnderecoRepository } from '../repositories/endereco.repository.js'

export class EnderecoService {
  constructor(private readonly repository: EnderecoRepository) {}

  async domain() {
    const states = await this.repository.domain()
    return states.map((state) => ({ ...state, cn_estado: state.cn_estado.toString() }))
  }
}
