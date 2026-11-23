import type { FastifyRequest } from 'fastify'
import type { BrandService } from '../services/brand.service.js'
import { BrandValidator } from '../validators/brand.validator.js'
import { DataValidator } from '../validators/data.validator.js'

export class BrandController {
  constructor(private readonly service: BrandService) {}

  list = () => this.service.list()

  create = (request: FastifyRequest) => this.service.create(BrandValidator.parse(request.body))

  update = (request: FastifyRequest) =>
    this.service.update(
      DataValidator.code(DataValidator.object(request.body).cn_marca),
      BrandValidator.parse(request.body),
    )
}
