import type { FastifyRequest } from 'fastify'
import type { OrdemServicoService } from '../services/ordem-servico.service.js'
import { OrdemServicoValidator } from '../validators/ordem-servico.validator.js'
import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'

export class OrdemServicoController {
  constructor(private readonly service: OrdemServicoService) {}

  paramClassificacao = () => this.service.paramClassificacao()

  viewClassificacao = () => this.service.viewClassificacao()

  manutIncClassificacao = (request: FastifyRequest) =>
    this.service.manutClassificacao(null, OrdemServicoValidator.manutClassificacao(request.body))

  manutAltClassificacao = (request: FastifyRequest) =>
    this.service.manutClassificacao(
      DataValidator.id(DataValidator.object(request.body).cn_classificacao_os),
      OrdemServicoValidator.manutClassificacao(request.body),
    )

  view = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)
    return this.service.view(
      page,
      limit,
      search,
      OrdemServicoValidator.validarFiltros(request.body),
    )
  }

  detalhar = (request: FastifyRequest) => this.service.detalhar(this.id(request))

  paramFuncionarios = () => this.service.paramFuncionarios()
  paramVeiculos = () => this.service.paramVeiculos()

  manutIncMarcaVeiculo = (request: FastifyRequest) => this.manutMarcaVeiculo(request, false)
  manutAltMarcaVeiculo = (request: FastifyRequest) => this.manutMarcaVeiculo(request, true)
  manutIncModeloVeiculo = (request: FastifyRequest) => this.manutModeloVeiculo(request, false)
  manutAltModeloVeiculo = (request: FastifyRequest) => this.manutModeloVeiculo(request, true)

  private manutMarcaVeiculo(request: FastifyRequest, alterar: boolean) {
    const dados = DataValidator.object(request.body)
    return this.service.manutMarcaVeiculo(
      alterar ? DataValidator.code(dados.cn_marca_veiculo) : null,
      DataValidator.text(dados.an_descr, 'a descrição'),
    )
  }

  private manutModeloVeiculo(request: FastifyRequest, alterar: boolean) {
    const dados = DataValidator.object(request.body)
    return this.service.manutModeloVeiculo(
      alterar ? DataValidator.code(dados.cn_modelo_veiculo) : null,
      DataValidator.code(dados.cn_marca_veiculo),
      DataValidator.text(dados.an_descr, 'a descrição'),
    )
  }

  consultarPlaca = (request: FastifyRequest) =>
    this.service.consultarPlaca(
      OrdemServicoValidator.validarPlaca(DataValidator.object(request.body).an_placa),
    )

  viewEvidencias = (request: FastifyRequest) => this.service.viewEvidencias(this.id(request))

  manutIncEvidencia = (request: FastifyRequest) =>
    this.service.manutIncEvidencia(
      this.id(request),
      OrdemServicoValidator.validarEvidencia(request.body),
    )

  manutAltDescricaoEvidencia = (request: FastifyRequest) => {
    const dados = DataValidator.object(request.body)
    return this.service.manutAltDescricaoEvidencia(
      this.id(request),
      DataValidator.id(dados.cn_evidencia),
      OrdemServicoValidator.descricaoEvidencia(dados.an_descr),
    )
  }

  paramOrdensFaturaveis = (request: FastifyRequest) => {
    const { page, limit } = PaginationValidator.parse(request.body)
    return this.service.paramOrdensFaturaveis(page, limit)
  }

  manutMovimentar = (request: FastifyRequest) =>
    this.service.manutMovimentar(
      this.id(request),
      OrdemServicoValidator.validarMovimento(request.body),
    )

  manutInc = (request: FastifyRequest) =>
    this.service.manutOrdemServico(null, OrdemServicoValidator.manut(request.body))

  manutAlt = (request: FastifyRequest) =>
    this.service.manutOrdemServico(this.id(request), OrdemServicoValidator.manut(request.body))

  manutIncItem = (request: FastifyRequest) =>
    this.service.manutItem(this.id(request), null, OrdemServicoValidator.manutItem(request.body))

  manutAltItem = (request: FastifyRequest) =>
    this.service.manutItem(
      this.id(request),
      this.codigoItem(request),
      OrdemServicoValidator.manutItem(request.body),
    )

  manutRemoverItem = (request: FastifyRequest) =>
    this.service.manutRemoverItem(this.id(request), this.codigoItem(request))

  manutTempoItem = (request: FastifyRequest) =>
    this.service.manutTempoItem(
      this.id(request),
      this.codigoItem(request),
      OrdemServicoValidator.validarAcaoTempo(request.body),
    )

  private id(request: FastifyRequest) {
    return DataValidator.id(DataValidator.object(request.body).cn_ordem)
  }

  private codigoItem(request: FastifyRequest) {
    return DataValidator.id(DataValidator.object(request.body).cn_item)
  }
}
