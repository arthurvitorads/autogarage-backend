import { ApiResponse } from '../http/api-response.js'
import { OrdemServicoModel } from '../models/ordem-servico.model.js'
import { ApiError } from '../interfaces/error.js'
import type { IOrdemServicoRepository } from '../repositories/ordem-servico.repository.js'
import type {
  IManutOrdemServico,
  IManutEvidenciaOrdemServico,
  IManutClassificacaoOrdemServico,
  IManutItemOrdemServico,
  IFiltroOrdemServico,
  IMovimentoOrdemServico,
} from '../interfaces/ordem-servico.js'

export class OrdemServicoService {
  constructor(private readonly ordemServico: IOrdemServicoRepository) {}

  async paramClassificacao() {
    return (await this.ordemServico.viewClassificacao()).map(OrdemServicoModel.paraParam)
  }

  async viewClassificacao() {
    return (await this.ordemServico.viewClassificacao()).map(OrdemServicoModel.classification)
  }

  async manutClassificacao(id: bigint | null, dados: IManutClassificacaoOrdemServico) {
    return OrdemServicoModel.classification(await this.ordemServico.manutClassificacao(id, dados))
  }

  async view(page: number, limit: number, search: string, filters: IFiltroOrdemServico = {}) {
    const { ordens, total } = await this.ordemServico.view(page, limit, search, filters)
    return ApiResponse.page({
      dados: ordens.map(OrdemServicoModel.paraResposta),
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }

  async detalhar(id: bigint) {
    const ordem = await this.ordemServico.detalhar(id)
    if (!ordem) throw new ApiError(404, 'Ordem de serviço não encontrada.')
    return OrdemServicoModel.paraResposta(ordem)
  }

  async paramFuncionarios() {
    return (await this.ordemServico.paramFuncionarios()).map(OrdemServicoModel.responsavel)
  }

  manutMarcaVeiculo(id: number | null, an_descr: string) {
    return this.ordemServico.manutMarcaVeiculo(id, an_descr)
  }

  manutModeloVeiculo(id: number | null, cn_marca_veiculo: number, an_descr: string) {
    return this.ordemServico.manutModeloVeiculo(id, cn_marca_veiculo, an_descr)
  }

  paramVeiculos() {
    return this.ordemServico.paramVeiculos()
  }

  consultarPlaca(plate: string) {
    return this.ordemServico.consultarPlaca(plate)
  }

  async viewEvidencias(id: bigint) {
    return (await this.ordemServico.viewEvidencias(id)).map(OrdemServicoModel.evidencia)
  }

  async manutIncEvidencia(id: bigint, dados: IManutEvidenciaOrdemServico) {
    return OrdemServicoModel.evidencia(await this.ordemServico.manutIncEvidencia(id, dados))
  }

  manutAltDescricaoEvidencia(id: bigint, cn_evidencia: bigint, an_descr: string) {
    return this.ordemServico.manutAltDescricaoEvidencia(id, cn_evidencia, an_descr)
  }

  async paramOrdensFaturaveis(page: number, limit: number) {
    const { response } = await this.view(page, limit, '', { billable: true })
    const { dados: orders, pagination } = response
    return ApiResponse.page({
      pagination,
      dados: orders.map(({ cn_ordem, cn_pessoa, nu_numero, an_cliente, ca_status, itens }) => ({
        cn_ordem,
        cn_pessoa,
        nu_numero,
        an_cliente,
        ca_status,
        itens: itens.map(({ ca_tipo, an_descr, qt_quantidade, vl_unitario, vl_total }) => ({
          ca_tipo,
          an_descr,
          qt_quantidade,
          vl_unitario,
          vl_total,
        })),
      })),
    })
  }

  async manutMovimentar(id: bigint, dados: IMovimentoOrdemServico) {
    return OrdemServicoModel.paraResposta(await this.ordemServico.manutMovimentar(id, dados))
  }

  async manutOrdemServico(id: bigint | null, dados: IManutOrdemServico) {
    return OrdemServicoModel.paraResposta(await this.ordemServico.manutOrdemServico(id, dados))
  }

  async manutItem(codigoOrdem: bigint, codigoItem: bigint | null, dados: IManutItemOrdemServico) {
    return OrdemServicoModel.item(await this.ordemServico.manutItem(codigoOrdem, codigoItem, dados))
  }

  manutRemoverItem(codigoOrdem: bigint, codigoItem: bigint) {
    return this.ordemServico.manutRemoverItem(codigoOrdem, codigoItem)
  }

  async manutTempoItem(
    codigoOrdem: bigint,
    codigoItem: bigint,
    acao: 'INICIAR' | 'PAUSAR' | 'FINALIZAR',
  ) {
    return OrdemServicoModel.item(
      await this.ordemServico.manutTempoItem(codigoOrdem, codigoItem, acao),
    )
  }
}
