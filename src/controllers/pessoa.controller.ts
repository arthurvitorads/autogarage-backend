import type { FastifyRequest } from 'fastify'

import type { PessoaService } from '../services/pessoa.service.js'
import { CepService } from '../services/cep.service.js'
import { ApiError } from '../interfaces/error.js'

import { PaginationValidator } from '../validators/pagination.validator.js'
import { PessoaValidator } from '../validators/pessoa.validator.js'
import { DataValidator } from '../validators/data.validator.js'

export class PessoaController {
  constructor(private readonly service: PessoaService) {}

  param = () => this.service.param()
  detalhar = (request: FastifyRequest) =>
    this.service.detalhar(DataValidator.id(DataValidator.object(request.body).cn_pessoa))

  consultarCliente = (request: FastifyRequest) => {
    const { cn_pessoa, cn_ordem_servico } = DataValidator.object(request.body)
    const orderId = cn_ordem_servico === undefined ? undefined : DataValidator.id(cn_ordem_servico)
    return this.service.consultarCliente(DataValidator.id(cn_pessoa), orderId)
  }

  consultarClienteOrdem = (request: FastifyRequest) =>
    this.service.consultarCliente(DataValidator.id(DataValidator.object(request.body).cn_pessoa))

  manutInc = (request: FastifyRequest) => this.service.manutInc(PessoaValidator.parse(request.body))

  consultarDocumento = (request: FastifyRequest) => {
    const { ca_cpf, ca_cnpj, cn_pessoa } = DataValidator.object(request.body)
    if ((ca_cpf === undefined) === (ca_cnpj === undefined))
      throw new ApiError(400, 'Informe um CPF ou CNPJ.')
    const tipo = ca_cpf === undefined ? 'PJ' : 'PF'
    const documento = DataValidator.text(ca_cpf ?? ca_cnpj, 'o documento').replace(/[./-]/g, '').toUpperCase()
    if (!PessoaValidator.document(documento, tipo)) throw new ApiError(400, 'Documento inválido.')
    return this.service.consultarDocumento(
      tipo,
      documento,
      cn_pessoa === undefined ? undefined : DataValidator.id(cn_pessoa),
    )
  }

  consultarCnpj = (request: FastifyRequest) => {
    const { ca_cnpj, cn_pessoa } = DataValidator.object(request.body)
    const cnpj = DataValidator.text(ca_cnpj, 'o CNPJ').replace(/[./-]/g, '').toUpperCase()
    if (!PessoaValidator.document(cnpj, 'PJ')) throw new ApiError(400, 'CNPJ inválido.')
    return this.service.consultarCnpj(
      cnpj,
      cn_pessoa === undefined ? undefined : DataValidator.id(cn_pessoa),
    )
  }

  consultarCep = (request: FastifyRequest) => {
    const { ca_cep, cep } = DataValidator.object(request.body)
    const postalCode = DataValidator.text(ca_cep ?? cep, 'o CEP')
    if (!/^\d{5}-?\d{3}$/.test(postalCode)) throw new ApiError(400, 'CEP inválido.')
    return CepService.consultarCep(postalCode.replace('-', ''))
  }

  manutAlt = (request: FastifyRequest) =>
    this.service.manutAlt(
      DataValidator.id(DataValidator.object(request.body).cn_pessoa),
      PessoaValidator.parse(request.body),
    )

  view = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)

    return this.service.view(page, limit, search)
  }
}
