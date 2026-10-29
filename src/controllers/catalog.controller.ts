import type { FastifyRequest } from 'fastify'
import type { CatalogService } from '../services/catalog.service.js'
import { CatalogValidator } from '../validators/catalog.validator.js'
import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'

export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  products = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.query)

    return this.service.products(page, limit, search)
  }

  services = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.query)

    return this.service.services(page, limit, search)
  }

  createProduct = (request: FastifyRequest) => this.service.createProduct(CatalogValidator.product(request.body))

  updateProduct = (request: FastifyRequest) => this.service.updateProduct(this.id(request), CatalogValidator.product(request.body))

  createService = (request: FastifyRequest) => this.service.createService(CatalogValidator.service(request.body))

  updateService = (request: FastifyRequest) => this.service.updateService(this.id(request), CatalogValidator.service(request.body))

  auxiliaries = () => this.service.auxiliaries()

  createAuxiliary = (request: FastifyRequest) => this.service.createAuxiliary(CatalogValidator.auxiliary(request.body))

  updateAuxiliary = (request: FastifyRequest) => this.service.updateAuxiliary(this.id(request), CatalogValidator.auxiliary(request.body))

  private id(request: FastifyRequest) {
    return DataValidator.code((request.params as {
      id: string
    }).id)
  }
}
