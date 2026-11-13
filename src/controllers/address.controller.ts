import type { AddressService } from '../services/address.service.js'

export class AddressController {
  constructor(private readonly service: AddressService) {}

  listStates = () => this.service.listStates()
}
