import { PersonModel } from '../models/person.model.js'

import type { IPersonRepository } from '../repositories/person.repository.js'
import type { IManutPerson } from '../interfaces/person.js'
import { ApiError } from '../interfaces/error.js'

export class PersonService {
  constructor(
    private readonly person: IPersonRepository,
  ) {}

  async paramList() {
    const pessoas = await this.person.paramList()
    return {
      clientes: pessoas.map(pessoa => ({
        cn_pessoa: pessoa.cn_pessoa.toString(),
        tipo: pessoa.ca_tipo,
        an_nome: pessoa.an_nome ?? pessoa.an_razao_social ?? '',
        an_documento: pessoa.ca_cpf ?? pessoa.ca_cnpj ?? '',
      }))
    }
  }

  async create(values: IManutPerson) {
    return PersonModel.toResponse(await this.person.create(values))
  }

  async update(id: bigint, values: IManutPerson) {
    if (!await this.person.findById(id))
      throw new ApiError(404, 'Pessoa não encontrada.')
    return PersonModel.toResponse(await this.person.update(id, values))
  }

  async list(page: number, limit: number, search: string) {
    const { pessoas, total } = await this.person.list(page, limit, search)

    return {
      pessoa: pessoas.map(PersonModel.toResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    }
  }
}
