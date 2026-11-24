import type { CatalogoService } from '../services/catalogo.service.js'

export class CatalogoController {
  constructor(private readonly service: CatalogoService) {}

  param = () => this.service.param()
}
