import { ApiResponse } from '../http/api-response.js'
import { PersonModel } from '../models/person.model.js'

import type { IPersonRepository } from '../repositories/person.repository.js'
import type { IManutPerson } from '../interfaces/person.js'
import { ApiError } from '../interfaces/error.js'

export class PersonService {
  async findById(id: bigint) {
    const pessoa = await this.person.findById(id)
    if (!pessoa) throw new ApiError(404, 'Pessoa não encontrada.')
    return PersonModel.toResponse(pessoa)
  }

  constructor(private readonly person: IPersonRepository) {}

  async customer(id: bigint, orderId?: bigint) {
    const person = await this.person.findSaleCustomer(id, orderId)
    if (!person) throw new ApiError(404, 'Cliente não encontrado.')
    return person
  }

  async paramList() {
    const pessoas = await this.person.paramList()
    return pessoas.map((pessoa) => ({
      cn_pessoa: pessoa.cn_pessoa.toString(),
      ca_tipo: pessoa.ca_tipo,
      an_nome: pessoa.an_nome,
      an_razao_social: pessoa.an_razao_social,
      ca_cpf: pessoa.ca_cpf,
      ca_cnpj: pessoa.ca_cnpj,
    }))
  }

  async create(values: IManutPerson) {
    await this.validateState(values.endereco.cn_estado)
    return PersonModel.toResponse(await this.person.create(values))
  }

  async update(id: bigint, values: IManutPerson) {
    if (!(await this.person.findById(id))) throw new ApiError(404, 'Pessoa não encontrada.')
    await this.validateState(values.endereco.cn_estado)
    return PersonModel.toResponse(await this.person.update(id, values))
  }

  private async validateState(id: bigint) {
    if (!(await this.person.findBrazilianState(id))) throw new ApiError(400, 'UF inválida.')
  }

  async list(page: number, limit: number, search: string) {
    const { pessoas, total } = await this.person.list(page, limit, search)

    return ApiResponse.page({
      dados: pessoas.map(PersonModel.toResponse),
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }
}
