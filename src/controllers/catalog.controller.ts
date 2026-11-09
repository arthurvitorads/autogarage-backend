import type { FastifyRequest } from 'fastify'
import type { CatalogService } from '../services/catalog.service.js'
import { CatalogValidator } from '../validators/catalog.validator.js'
import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'

export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  products = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)

    return this.service.products(page, limit, search)
  }

  services = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)

    return this.service.services(page, limit, search)
  }

  createProduct = (request: FastifyRequest) =>
    this.service.createProduct(CatalogValidator.product(request.body))

  updateProduct = (request: FastifyRequest) =>
    this.service.updateProduct(
      DataValidator.code(DataValidator.object(request.body).cn_produto),
      CatalogValidator.product(request.body),
    )

  createService = (request: FastifyRequest) =>
    this.service.createService(CatalogValidator.service(request.body))

  updateService = (request: FastifyRequest) =>
    this.service.updateService(
      DataValidator.code(DataValidator.object(request.body).cn_servico),
      CatalogValidator.service(request.body),
    )

  auxiliaries = () => this.service.auxiliaries()

  itemOptions = () => this.service.itemOptions()

  createAuxiliary = (request: FastifyRequest) =>
    this.service.createAuxiliary(CatalogValidator.auxiliary(request.body))

  updateAuxiliary = (request: FastifyRequest) =>
    this.service.updateAuxiliary(
      DataValidator.code(DataValidator.object(request.body).cn_cadastro),
      CatalogValidator.auxiliary(request.body),
    )
}
