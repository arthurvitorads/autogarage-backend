import type { AddressRepository } from '../repositories/address.repository.js'

export class AddressService {
  constructor(private readonly repository: AddressRepository) {}

  async listStates() {
    const states = await this.repository.listStates()
    return states.map((state) => ({ ...state, cn_estado: state.cn_estado.toString() }))
  }
}
