import { ApiResponse } from '../http/api-response.js'
import { PessoaModel } from '../models/pessoa.model.js'

import type { IPessoaRepository } from '../repositories/pessoa.repository.js'
import type { IManutPessoa } from '../interfaces/pessoa.js'
import { ApiError } from '../interfaces/error.js'

export class PessoaService {
  async detalhar(id: bigint) {
    const pessoa = await this.pessoaRepository.detalhar(id)
    if (!pessoa) throw new ApiError(404, 'Pessoa não encontrada.')
    return PessoaModel.paraResposta(pessoa)
  }

  constructor(private readonly pessoaRepository: IPessoaRepository) {}

  async consultarCliente(id: bigint, codigoOrdem?: bigint) {
    const pessoaRepository = await this.pessoaRepository.consultarClienteVenda(id, codigoOrdem)
    if (!pessoaRepository) throw new ApiError(404, 'Cliente não encontrado.')
    return pessoaRepository
  }

  async param() {
    const pessoas = await this.pessoaRepository.param()
    return pessoas.map((pessoa) => ({
      cn_pessoa: pessoa.cn_pessoa.toString(),
      ca_tipo: pessoa.ca_tipo,
      an_nome: pessoa.an_nome,
      an_razao_social: pessoa.an_razao_social,
      ca_cpf: pessoa.ca_cpf,
      ca_cnpj: pessoa.ca_cnpj,
    }))
  }

  async manutInc(dados: IManutPessoa) {
    await this.validarEstado(dados.endereco.cn_estado)
    return PessoaModel.paraResposta(await this.pessoaRepository.manutInc(dados))
  }

  async manutAlt(id: bigint, dados: IManutPessoa) {
    if (!(await this.pessoaRepository.detalhar(id))) throw new ApiError(404, 'Pessoa não encontrada.')
    await this.validarEstado(dados.endereco.cn_estado)
    return PessoaModel.paraResposta(await this.pessoaRepository.manutAlt(id, dados))
  }

  private async validarEstado(id: bigint) {
    if (!(await this.pessoaRepository.consultarEstadoBrasileiro(id))) throw new ApiError(400, 'UF inválida.')
  }

  async view(page: number, limit: number, search: string) {
    const { pessoas, total } = await this.pessoaRepository.view(page, limit, search)

    return ApiResponse.page({
      dados: pessoas.map(PessoaModel.paraResposta),
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }
}
