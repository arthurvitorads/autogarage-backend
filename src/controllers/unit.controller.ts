import type { FastifyRequest } from 'fastify'
import type { UnitService } from '../services/unit.service.js'
import { UnitValidator } from '../validators/unit.validator.js'
import { DataValidator } from '../validators/data.validator.js'

export class UnitController {
  constructor(private readonly service: UnitService) {}

  list = () => this.service.list()

  create = (request: FastifyRequest) => this.service.create(UnitValidator.parse(request.body))

  update = (request: FastifyRequest) =>
    this.service.update(
      DataValidator.code(DataValidator.object(request.body).cn_unidade),
      UnitValidator.parse(request.body),
    )
}
