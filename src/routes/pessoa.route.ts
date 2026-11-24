import type { ApiRouter } from '../http/api-router.js'

import type { PessoaController } from '../controllers/pessoa.controller.js'

export class PessoaRoutes {
  constructor(private readonly controller: PessoaController) {}

  register(router: ApiRouter) {
    router.post('/pessoa/view', this.controller.view, [['CADASTROS', 2]], 200)
    router.post('/pessoa/detalhar', this.controller.detalhar, [['CADASTROS', 2]], 200)
    router.post('/faturamento/cliente', this.controller.consultarCliente, [['FATURAMENTO', 1]], 200)
    router.post('/ordensServico/cliente', this.controller.consultarClienteOrdem, [['ORDEM_SERVICO', 1]], 200)
    router.post('/pessoa/param', this.controller.param, [['CADASTROS', 2], ['ORDEM_SERVICO', 1], ['FATURAMENTO', 1]], 200)
    router.manut('/pessoa/manut', 'cn_pessoa', this.controller.manutInc, this.controller.manutAlt, [['CADASTROS', 1]])
    router.post('/pessoa/consultar-cnpj', this.controller.consultarCnpj, [['CADASTROS', 1]], 200)
    router.post('/pessoa/consultar-cep', this.controller.consultarCep, [['CADASTROS', 1]], 200)
  }
}
