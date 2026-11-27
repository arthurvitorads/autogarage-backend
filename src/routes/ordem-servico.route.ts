import type { OrdemServicoController } from '../controllers/ordem-servico.controller.js'

import type { ApiRouter } from '../http/api-router.js'
import { MAX_ORDER_EVIDENCES, MAX_ORDER_EVIDENCE_BYTES } from '../interfaces/ordem-servico.js'

const limiteCorpoOrdem = MAX_ORDER_EVIDENCES * 4 * Math.ceil(MAX_ORDER_EVIDENCE_BYTES / 3) + 65536

export class OrdemServicoRoutes {
  constructor(private readonly controller: OrdemServicoController) {}

  register(router: ApiRouter) {
    router.post(
      '/classificacoesOrdens/param',
      this.controller.paramClassificacao,
      [
        ['CADASTROS', 2],
        ['ORDEM_SERVICO', 2],
      ],
      200,
    )
    router.post(
      '/classificacoesOrdens/view',
      this.controller.viewClassificacao,
      [
        ['CADASTROS', 2],
        ['ORDEM_SERVICO', 2],
      ],
      200,
    )
    router.manut(
      '/classificacoesOrdens/manut',
      'cn_classificacao_os',
      this.controller.manutIncClassificacao,
      this.controller.manutAltClassificacao,
      [['CADASTROS', 1]],
    )
    router.post('/ordensServico/view', this.controller.view, [['ORDEM_SERVICO', 2]], 200)
    router.post('/ordensServico/detalhar', this.controller.detalhar, [['ORDEM_SERVICO', 2]], 200)
    router.post(
      '/faturamento/ordens/param',
      this.controller.paramOrdensFaturaveis,
      [['FATURAMENTO', 1]],
      200,
    )
    router.manut(
      '/ordensServico/manut',
      'cn_ordem',
      this.controller.manutInc,
      this.controller.manutAlt,
      [['ORDEM_SERVICO', 1]],
      limiteCorpoOrdem,
    )
    router.post(
      '/ordensServico/funcionarios/param',
      this.controller.paramFuncionarios,
      [['ORDEM_SERVICO', 1]],
      200,
    )
    router.post(
      '/ordensServico/veiculos/param',
      this.controller.paramVeiculos,
      [['ORDEM_SERVICO', 2]],
      200,
    )
    router.post(
      '/ordensServico/consultar-placa',
      this.controller.consultarPlaca,
      [['ORDEM_SERVICO', 1]],
      200,
    )
    router.post(
      '/ordensServico/evidencias/view',
      this.controller.viewEvidencias,
      [['ORDEM_SERVICO', 2]],
      200,
    )
    router.post(
      '/ordensServico/manut/movimentar',
      this.controller.manutMovimentar,
      [['ORDEM_SERVICO', 1]],
      200,
    )
    router.manut(
      '/ordensServico/itens/manut',
      'cn_item',
      this.controller.manutIncItem,
      this.controller.manutAltItem,
      [['ORDEM_SERVICO', 1]],
    )
    router.post(
      '/ordensServico/itens/manut/remover',
      this.controller.manutRemoverItem,
      [['ORDEM_SERVICO', 1]],
      200,
    )
    router.post(
      '/ordensServico/itens/manut/tempo',
      this.controller.manutTempoItem,
      [['ORDEM_SERVICO', 1]],
      200,
    )
  }
}
