import { ApiResponse } from '../http/api-response.js'
import { PessoaModel } from '../models/pessoa.model.js'

import type { IPessoaRepository } from '../repositories/pessoa.repository.js'
import type { IManutPessoa } from '../interfaces/pessoa.js'
import { ApiError } from '../interfaces/error.js'
import { DocumentoService } from './documento.service.js'

const documentoDuplicado = 'O documento já está sendo utilizado em outro cadastro.'

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
    await this.validarDocumentoDisponivel(dados)
    await this.validarEstado(dados.endereco.cn_estado)
    return this.gravar(() => this.pessoaRepository.manutInc(dados))
  }

  async manutAlt(id: bigint, dados: IManutPessoa) {
    if (!(await this.pessoaRepository.detalhar(id))) throw new ApiError(404, 'Pessoa não encontrada.')
    await this.validarDocumentoDisponivel(dados, id)
    await this.validarEstado(dados.endereco.cn_estado)
    return this.gravar(() => this.pessoaRepository.manutAlt(id, dados))
  }

  async consultarDocumento(tipo: IManutPessoa['ca_tipo'], documento: string, id?: bigint) {
    const bo_uso = await this.pessoaRepository.documentoEmUso(tipo, documento, id)
    return { bo_uso }
  }

  async consultarCnpj(cnpj: string, id?: bigint) {
    if (await this.pessoaRepository.documentoEmUso('PJ', cnpj, id))
      throw new ApiError(409, documentoDuplicado)
    return DocumentoService.consultarCnpj(cnpj)
  }

  private async validarDocumentoDisponivel(dados: IManutPessoa, id?: bigint) {
    const documento = dados.ca_tipo === 'PF' ? dados.ca_cpf : dados.ca_cnpj
    if (documento && await this.pessoaRepository.documentoEmUso(dados.ca_tipo, documento, id))
      throw new ApiError(409, documentoDuplicado)
  }

  private async gravar(operacao: () => ReturnType<IPessoaRepository['manutInc']>) {
    try {
      return PessoaModel.paraResposta(await operacao())
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002')
        throw new ApiError(409, documentoDuplicado)
      throw error
    }
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
