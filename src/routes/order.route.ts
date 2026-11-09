import type { OrderController } from '../controllers/order.controller.js'

import type { ApiRouter } from '../http/api-router.js'

export class OrderRoutes {
  constructor(private readonly controller: OrderController) {}

  register(router: ApiRouter) {
    router.post('/ordemClassificacao', this.controller.classificationList, [['CADASTROS', 2], ['ORDEM_SERVICO', 2]], 200)
    router.post('/classificacoesOrdens/listar', this.controller.classifications, [['CADASTROS', 2], ['ORDEM_SERVICO', 2]], 200)
    router.post('/classificacoesOrdens', this.controller.createClassification, [['CADASTROS', 1]])
    router.post('/classificacoesOrdens/atualizar', this.controller.updateClassification, [['CADASTROS', 1]], 200)
    router.post('/ordensServico/listar', this.controller.list, [['ORDEM_SERVICO', 2]], 200)
    router.post('/ordensServico/detalhar', this.controller.findById, [['ORDEM_SERVICO', 2]], 200)
    router.post('/faturamento/ordens/listar', this.controller.billableOrders, [['FATURAMENTO', 1]], 200)
    router.post('/ordensServico', this.controller.create, [['ORDEM_SERVICO', 1]])
    router.post('/ordensServico/movimentar', this.controller.move, [['ORDEM_SERVICO', 1]], 200)
    router.post('/ordensServico/atualizar', this.controller.update, [['ORDEM_SERVICO', 1]], 200)
    router.post('/ordensServico/itens', this.controller.createItem, [['ORDEM_SERVICO', 1]])
    router.post('/ordensServico/itens/atualizar', this.controller.updateItem, [['ORDEM_SERVICO', 1]], 200)
    router.post('/ordensServico/itens/remover', this.controller.removeItem, [['ORDEM_SERVICO', 1]], 200)
    router.post('/ordensServico/itens/tempo', this.controller.timeItem, [['ORDEM_SERVICO', 1]], 200)
  }
}
