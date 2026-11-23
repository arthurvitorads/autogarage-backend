import type { CatalogService } from '../services/catalog.service.js'

export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  itemOptions = () => this.service.itemOptions()
}
