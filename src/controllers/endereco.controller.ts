import type { EnderecoService } from '../services/endereco.service.js'

export class EnderecoController {
  constructor(private readonly service: EnderecoService) {}

  domain = () => this.service.domain()
}
