import { ApiResponse } from '../http/api-response.js'
import type { ServicoRepository } from '../repositories/servico.repository.js'
import type { IManutServico } from '../interfaces/servico.js'
import { ServicoModel } from '../models/servico.model.js'

export class ServicoService {
  constructor(
    private readonly repository: Pick<ServicoRepository, 'view' | 'manutInc' | 'manutAlt'>,
  ) {}

  async view(page: number, limit: number, search: string) {
    const { servicos, total } = await this.repository.view(page, limit, search)

    return ApiResponse.page({
      dados: servicos.map(ServicoModel.paraResposta),
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }

  async manutInc(values: IManutServico) {
    return ServicoModel.paraResposta(await this.repository.manutInc(values))
  }

  async manutAlt(id: number, values: IManutServico) {
    return ServicoModel.paraResposta(await this.repository.manutAlt(id, values))
  }
}
