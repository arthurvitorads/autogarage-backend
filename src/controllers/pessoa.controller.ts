import type { FastifyRequest } from 'fastify'

import type { PessoaService } from '../services/pessoa.service.js'
import { DocumentoService } from '../services/documento.service.js'
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

  consultarCnpj = (request: FastifyRequest) => {
    const { ca_cnpj, cnpj } = DataValidator.object(request.body)
    const document = DataValidator.text(ca_cnpj ?? cnpj, 'o CNPJ').replace(/[.\/-]/g, '').toUpperCase()
    if (!PessoaValidator.document(document, 'PJ')) throw new ApiError(400, 'CNPJ inválido.')
    return DocumentoService.consultarCnpj(document)
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
