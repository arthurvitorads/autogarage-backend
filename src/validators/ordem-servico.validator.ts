import type {
  IManutOrdemServico,
  IManutClassificacaoOrdemServico,
  IManutItemOrdemServico,
  IFiltroOrdemServico,
  IMovimentoOrdemServico,
  TStatusOrdemServico,
} from '../interfaces/ordem-servico.js'
import { ApiError } from '../interfaces/error.js'
import { MAX_ORDER_EVIDENCES, MAX_ORDER_EVIDENCE_BYTES } from '../interfaces/ordem-servico.js'
import { DataValidator as Data } from './data.validator.js'

export class OrdemServicoValidator {
  static validarAcaoTempo(body: unknown): 'INICIAR' | 'PAUSAR' | 'FINALIZAR' {
    const { acao } = Data.object(body)
    if (acao !== 'INICIAR' && acao !== 'PAUSAR' && acao !== 'FINALIZAR')
      throw new ApiError(400, 'Ação de tempo inválida.')
    return acao
  }

  static validarFiltros(query: unknown): IFiltroOrdemServico {
    const data = Data.object(query ?? {})
    const status = this.filtroLista(data.status).map((value) => {
      if (
        value !== 'ABERTO' &&
        value !== 'EM_ANDAMENTO' &&
        value !== 'FINALIZADO' &&
        value !== 'CANCELADO'
      )
        throw new ApiError(400, 'Status inválido.')
      return value satisfies TStatusOrdemServico
    })
    const classificacao = this.filtroLista(data.classificacao).map(Data.id)
    const marca = this.filtroLista(data.an_marca).map((value) => Data.text(value, 'a marca'))
    const modelo = this.filtroLista(data.an_modelo).map((value) => Data.text(value, 'o modelo'))
    const inicio = data.inicio ? new Date(Data.text(data.inicio, 'a data inicial')) : undefined
    const fim = data.fim ? new Date(Data.text(data.fim, 'a data final')) : undefined
    if (
      (inicio && !Number.isFinite(inicio.getTime())) ||
      (fim && !Number.isFinite(fim.getTime())) ||
      (inicio && fim && inicio > fim)
    )
      throw new ApiError(400, 'Período inválido.')
    return {
      ...(status.length ? { status } : {}),
      ...(classificacao.length ? { classificacao } : {}),
      ...(marca.length ? { marca } : {}),
      ...(modelo.length ? { modelo } : {}),
      ...(inicio ? { inicio } : {}),
      ...(fim ? { fim } : {}),
    }
  }

  private static filtroLista(value: unknown): unknown[] {
    if (value === undefined || value === null || value === '') return []
    return this.validarLista(Array.isArray(value) ? value : [value], 500)
  }

  static validarMovimento(body: unknown): IMovimentoOrdemServico {
    const data = Data.object(body)
    if (data.acao !== 'INICIAR' && data.acao !== 'FINALIZAR' && data.acao !== 'CANCELAR')
      throw new ApiError(400, 'Ação inválida.')
    return {
      acao: data.acao,
      an_motivo_cancelamento:
        data.acao === 'CANCELAR'
          ? Data.text(data.an_motivo_cancelamento, 'o motivo do cancelamento')
          : '',
    }
  }

  static manutClassificacao(body: unknown): IManutClassificacaoOrdemServico {
    const data = Data.object(body)
    const cor = Data.text(data.ca_cor, 'a cor')
    if (!/^#[A-Fa-f0-9]{6}$/.test(cor)) throw new ApiError(400, 'Cor inválida.')
    return {
      an_descr: Data.text(data.an_descr, 'a descrição'),
      ca_cor: cor,
    }
  }

  static manut(body: unknown): IManutOrdemServico {
    const data = Data.object(body)
    const entrada = new Date(Data.text(data.dt_entrada, 'a data de entrada'))
    const previsao = data.dt_previsao ? new Date(Data.text(data.dt_previsao, 'a previsão')) : null
    if (
      !Number.isFinite(entrada.getTime()) ||
      (previsao && (!Number.isFinite(previsao.getTime()) || previsao < entrada))
    )
      throw new ApiError(400, 'Datas da ordem inválidas.')
    return {
      cn_pessoa: Data.id(data.cn_pessoa),
      ...(data.cn_responsaveis === undefined
        ? {}
        : {
            cn_responsaveis: [...new Set(this.validarLista(data.cn_responsaveis, 50).map(Data.id))],
          }),
      cn_classificacao_os: Data.id(data.cn_classificacao_os),
      dt_entrada: entrada,
      dt_previsao: previsao,
      an_placa: this.validarPlaca(data.an_placa),
      an_marca: Data.text(data.an_marca, 'a marca'),
      an_modelo: Data.text(data.an_modelo, 'o modelo'),
      nu_ano: Data.integer(data.nu_ano, 'o ano', 1900, new Date().getFullYear() + 1),
      an_cor: Data.text(data.an_cor, 'a cor', false),
      qt_quilometragem: Data.integer(data.qt_quilometragem, 'a quilometragem', 0, 9999999),
      an_solicitacao: Data.text(data.an_solicitacao, 'a solicitação', false),
      an_obs: Data.text(data.an_obs, 'a observação', false),
      evidencias: this.validarLista(data.evidencias, MAX_ORDER_EVIDENCES).map((item) =>
        this.validarEvidencia(item),
      ),
    }
  }

  static validarPlaca(value: unknown) {
    const placa = Data.text(value, 'a placa').toUpperCase()
    if (!/^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/.test(placa)) throw new ApiError(400, 'Placa inválida.')
    return placa.replace('-', '')
  }

  private static validarLista(value: unknown, limit: number): unknown[] {
    if (value === undefined) return []
    if (!Array.isArray(value) || value.length > limit)
      throw new ApiError(400, 'Quantidade de elementos inválida.')
    return value
  }

  private static validarEvidencia(value: unknown) {
    const { an_nome, ca_mime, bl_imagem } = Data.object(value)
    if (
      typeof bl_imagem !== 'string' ||
      bl_imagem.length > 4 * Math.ceil(MAX_ORDER_EVIDENCE_BYTES / 3) ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(bl_imagem)
    )
      throw new ApiError(400, 'Anexe uma imagem de até 1 MB.')

    const image = Buffer.from(bl_imagem, 'base64')
    const signatures = {
      'image/jpeg': () => image.subarray(0, 3).equals(Buffer.from([255, 216, 255])),
      'image/png': () => image.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')),
      'image/webp': () =>
        image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP',
    }
    if (
      image.length > MAX_ORDER_EVIDENCE_BYTES ||
      image.toString('base64') !== bl_imagem ||
      (ca_mime !== 'image/jpeg' && ca_mime !== 'image/png' && ca_mime !== 'image/webp') ||
      !signatures[ca_mime]()
    )
      throw new ApiError(400, 'Anexe uma imagem JPEG, PNG ou WebP válida de até 1 MB.')

    return {
      an_nome: Data.text(an_nome, 'o nome da imagem').slice(0, 255),
      ca_mime,
      bl_imagem: Uint8Array.from(image),
    }
  }

  static manutItem(body: unknown): IManutItemOrdemServico {
    const data = Data.object(body)
    if (data.ca_tipo !== 'PRODUTO' && data.ca_tipo !== 'SERVICO')
      throw new ApiError(400, 'Tipo de item inválido.')
    const quantidade = Data.decimal(data.qt_quantidade, 'a quantidade', 3, 999999999.999)
    if (!quantidade) throw new ApiError(400, 'A quantidade deve ser maior que zero.')
    return {
      ca_tipo: data.ca_tipo,
      cn_produto: data.ca_tipo === 'PRODUTO' ? Data.code(data.cn_produto) : null,
      cn_servico: data.ca_tipo === 'SERVICO' ? Data.code(data.cn_servico) : null,
      qt_quantidade: quantidade,
      vl_unitario: Data.decimal(data.vl_unitario, 'o preço'),
    }
  }
}
