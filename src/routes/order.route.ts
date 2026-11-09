import type { OrderController } from '../controllers/order.controller.js'

import type { ApiRouter } from '../http/api-router.js'

export class OrderRoutes {
  constructor(private readonly controller: OrderController) {}

  register(router: ApiRouter) {
    router.post('/ordemClassificacao', this.controller.classificationList, 200)
    router.post('/classificacoesOrdens/listar', this.controller.classifications, 200)
    router.post('/classificacoesOrdens', this.controller.createClassification)
    router.post('/classificacoesOrdens/atualizar', this.controller.updateClassification, 200)
    router.post('/ordensServico/listar', this.controller.list, 200)
    router.post('/ordensServico/detalhar', this.controller.findById, 200)
    router.post('/ordensServico', this.controller.create)
    router.post('/ordensServico/movimentar', this.controller.move, 200)
    router.post('/ordensServico/atualizar', this.controller.update, 200)
    router.post('/ordensServico/itens', this.controller.createItem)
    router.post('/ordensServico/itens/atualizar', this.controller.updateItem, 200)
    router.post('/ordensServico/itens/remover', this.controller.removeItem, 200)
    router.post('/ordensServico/itens/tempo', this.controller.timeItem, 200)
  }
}
