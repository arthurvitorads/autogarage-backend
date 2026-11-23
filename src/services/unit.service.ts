import type { UnitRepository } from '../repositories/unit.repository.js'
import type { IManutUnidade } from '../interfaces/unit.js'

export class UnitService {
  constructor(private readonly repository: Pick<UnitRepository, 'list' | 'create' | 'update'>) {}

  list() {
    return this.repository.list()
  }

  create(values: IManutUnidade) {
    return this.repository.create(values)
  }

  update(id: number, values: IManutUnidade) {
    return this.repository.update(id, values)
  }
}
