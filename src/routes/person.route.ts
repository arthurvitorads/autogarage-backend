import type { ApiRouter } from '../http/api-router.js'

import type { PersonController } from '../controllers/person.controller.js'

export class PersonRoutes {
  constructor(private readonly controller: PersonController) {}

  register(router: ApiRouter) {
    router.post('/pessoa/listar', this.controller.list, [['CADASTROS', 2]], 200)
    router.post('/pessoa/detalhar', this.controller.findById, [['CADASTROS', 2]], 200)
    router.post('/faturamento/cliente', this.controller.customer, [['FATURAMENTO', 1]], 200)
    router.post('/paramPessoa', this.controller.paramList, [['CADASTROS', 2], ['ORDEM_SERVICO', 1], ['FATURAMENTO', 1]], 200)
    router.post('/pessoa', this.controller.create, [['CADASTROS', 1]])
    router.post('/pessoa/atualizar', this.controller.update, [['CADASTROS', 1]], 200)
    router.post('/pessoa/consultar-cnpj', this.controller.lookupCnpj, [['CADASTROS', 1]], 200)
    router.post('/pessoa/consultar-cep', this.controller.lookupCep, [['CADASTROS', 1]], 200)
  }
}
