import { PersonModel } from '../models/person.model.js'

import type { IPersonRepository } from '../repositories/person.repository.js'

export class PersonService {
  constructor(
    private readonly person: IPersonRepository,
  ) {}

  async list(page: number, limit: number, search: string) {
    const { users, total } = await this.person.list(page, limit, search)
    
    return {
      pessoa: users.map(PersonModel.toResponse),
      pagination: {
        page, limit, total, totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total, hasPreviousPage: page > 1,
      },
    }
  }
}
