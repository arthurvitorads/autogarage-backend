import type { OrderController } from '../controllers/order.controller.js'

import type { ApiRouter } from '../http/api-router.js'

export class OrderRoutes {
  constructor(private readonly controller: OrderController) {}

  register(router: ApiRouter) {
    router.get('/ordemClassificacao', this.controller.classificationList)
    router.get('/classificacoesOrdens', this.controller.classifications)
    router.post('/classificacoesOrdens', this.controller.createClassification)
    router.post('/classificacoesOrdens/:id', this.controller.updateClassification, 200)
    router.get('/ordensServico', this.controller.list)
    router.get('/ordensServico/:id', this.controller.findById)
    router.post('/ordensServico', this.controller.create)
    router.post('/ordensServico/:id/movimentar', this.controller.move, 200)
    router.post('/ordensServico/:id', this.controller.update, 200)
    router.post('/ordensServico/:id/itens', this.controller.createItem)
    router.post('/ordensServico/:id/itens/:itemId', this.controller.updateItem, 200)
    router.post('/ordensServico/:id/itens/:itemId/remover', this.controller.removeItem, 200)
  }
}
