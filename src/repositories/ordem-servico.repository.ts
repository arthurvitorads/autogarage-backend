import { Prisma, type PrismaClient } from '@prisma/client'
import type {
  IManutOrdemServico,
  IManutClassificacaoOrdemServico,
  IManutItemOrdemServico,
  IFiltroOrdemServico,
  IMovimentoOrdemServico,
} from '../interfaces/ordem-servico.js'
import { MAX_ORDER_EVIDENCES } from '../interfaces/ordem-servico.js'
import { ApiError } from '../interfaces/error.js'
import { TempoItemOrdemServicoRepository } from './tempo-item-ordem-servico.repository.js'

export class OrdemServicoRepository {
  constructor(private readonly db: PrismaClient) {}

  viewClassificacao() {
    return this.db.ordClassificacaoOs.findMany({
      orderBy: { cn_classificacao_os: 'asc' },
    })
  }

  manutClassificacao(id: bigint | null, dados: IManutClassificacaoOrdemServico) {
    return id === null
      ? this.db.ordClassificacaoOs.create({ data: dados })
      : this.db.ordClassificacaoOs.update({
          where: { cn_classificacao_os: id },
          data: { ...dados, dt_alt: new Date() },
        })
  }

  async view(page: number, limit: number, search: string, filters: IFiltroOrdemServico = {}) {
    const where: Prisma.OrdOrdemServicoWhereInput = search
      ? {
          OR: [
            {
              an_placa: {
                contains: search.replace(/[\s-]/g, ''),
                mode: 'insensitive',
              },
            },
            { an_modelo: { contains: search, mode: 'insensitive' } },
            { an_marca: { contains: search, mode: 'insensitive' } },
            { pessoa: { an_nome: { contains: search, mode: 'insensitive' } } },
            {
              pessoa: {
                an_razao_social: { contains: search, mode: 'insensitive' },
              },
            },
            ...(/^\d+$/.test(search) && Number(search) <= 2147483647
              ? [{ nu_numero: Number(search) }]
              : []),
          ],
        }
      : {}
    if (filters.status) where.ca_status = filters.status
    if (filters.billable) {
      where.ca_status = 'FINALIZADO'
      where.itens = { some: {} }
      where.venda = { is: null }
    }
    if (filters.classificacao) where.cn_classificacao_os = filters.classificacao
    if (filters.inicio || filters.fim)
      where.dt_entrada = {
        ...(filters.inicio ? { gte: filters.inicio } : {}),
        ...(filters.fim ? { lte: filters.fim } : {}),
      }
    const [ordens, total] = await this.db.$transaction([
      this.db.ordOrdemServico.findMany({
        where,
        include: {
          venda: { select: { cn_venda: true } },
          pessoa: true,
          itens: { orderBy: { cn_item: 'asc' } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nu_numero: 'desc' },
      }),
      this.db.ordOrdemServico.count({ where }),
    ])
    return { ordens, total }
  }

  paramFuncionarios() {
    return this.db.cadPessoa.findMany({
      where: { bo_sts_reg: true, bo_categ_func: true },
      select: { cn_pessoa: true, an_nome: true, an_razao_social: true },
      orderBy: [{ an_nome: 'asc' }, { an_razao_social: 'asc' }],
    })
  }

  consultarPlaca(placa: string) {
    return this.db.ordOrdemServico.findFirst({
      where: { an_placa: placa },
      orderBy: [{ dt_entrada: 'desc' }, { cn_ordem_servico: 'desc' }],
      select: { an_marca: true, an_modelo: true, nu_ano: true, an_cor: true },
    })
  }

  viewEvidencias(id: bigint) {
    return this.db.ordEvidenciaOs.findMany({
      where: { cn_ordem_servico: id },
      orderBy: { cn_evidencia: 'asc' },
    })
  }

  detalhar(id: bigint) {
    return this.db.ordOrdemServico.findUnique({
      where: { cn_ordem_servico: id },
      include: {
        venda: { select: { cn_venda: true } },
        pessoa: true,
        itens: { orderBy: { cn_item: 'asc' } },
      },
    })
  }

  private async buscarOrdemEditavel(transaction: Prisma.TransactionClient, id: bigint) {
    const ordem = await transaction.ordOrdemServico.findUnique({
      where: { cn_ordem_servico: id },
    })
    if (!ordem) throw new ApiError(404, 'Ordem de serviço não encontrada.')
    if (ordem.ca_status === 'FINALIZADO' || ordem.ca_status === 'CANCELADO')
      throw new ApiError(409, 'Esta ordem está encerrada e permite apenas consulta.')
    return ordem
  }

  manutMovimentar(id: bigint, dados: IMovimentoOrdemServico) {
    return this.db.$transaction(
      async (transaction) => {
        const ordem = await this.buscarOrdemEditavel(transaction, id)
        if (
          (dados.acao === 'INICIAR' && ordem.ca_status !== 'ABERTO') ||
          (dados.acao === 'FINALIZAR' && ordem.ca_status !== 'EM_ANDAMENTO')
        )
          throw new ApiError(409, 'Ação indisponível para o status atual da ordem.')
        const agora = new Date()
        const servicos = await transaction.ordItemOs.findMany({
          where: { cn_ordem_servico: id, ca_tipo: 'SERVICO' },
        })
        for (const item of servicos) {
          if (dados.acao === 'INICIAR' && item.ca_status_servico === 'PENDENTE')
            await TempoItemOrdemServicoRepository.start(transaction, item, agora)
          if (dados.acao !== 'INICIAR' && item.ca_status_servico !== 'FINALIZADO')
            await TempoItemOrdemServicoRepository.stop(transaction, item, agora, dados.acao)
        }
        const data =
          dados.acao === 'INICIAR'
            ? { ca_status: 'EM_ANDAMENTO', dt_inicio: agora }
            : dados.acao === 'FINALIZAR'
              ? { ca_status: 'FINALIZADO', dt_finalizacao: agora }
              : {
                  ca_status: 'CANCELADO',
                  dt_cancelamento: agora,
                  an_motivo_cancelamento: dados.an_motivo_cancelamento,
                }
        return transaction.ordOrdemServico.update({
          where: { cn_ordem_servico: id },
          data: { ...data, dt_alt: agora },
          include: {
            venda: { select: { cn_venda: true } },
            pessoa: true,
            itens: true,
          },
        })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }

  manutOrdemServico(id: bigint | null, dados: IManutOrdemServico) {
    return this.db.$transaction(
      async (transaction) => {
        const { cn_responsavel, evidencias = [], ...data } = dados
        const existente = id === null ? null : await this.buscarOrdemEditavel(transaction, id)
        const pessoa = await transaction.cadPessoa.findUnique({
          where: { cn_pessoa: data.cn_pessoa },
        })
        if (!pessoa?.bo_sts_reg || !pessoa.bo_categ_cliente)
          throw new ApiError(400, 'Selecione um cliente ativo.')
        const status = await transaction.ordClassificacaoOs.findUnique({
          where: { cn_classificacao_os: data.cn_classificacao_os },
        })
        if (!status?.bo_sts_reg) throw new ApiError(400, 'Selecione uma classificação ativa.')

        let nomeResponsavel = existente?.an_responsavel ?? ''
        if (cn_responsavel === null) nomeResponsavel = ''
        if (cn_responsavel != null && cn_responsavel !== existente?.cn_responsavel) {
          const responsavel = await transaction.cadPessoa.findFirst({
            where: { cn_pessoa: cn_responsavel, bo_sts_reg: true, bo_categ_func: true },
            select: { an_nome: true, an_razao_social: true },
          })
          if (!responsavel) throw new ApiError(400, 'Selecione um funcionário ativo.')
          nomeResponsavel = responsavel.an_nome ?? responsavel.an_razao_social ?? ''
        }

        const dadosOrdem = {
          ...data,
          ...(cn_responsavel === undefined ? {} : { cn_responsavel }),
          an_responsavel: nomeResponsavel,
        }
        const order = id === null
          ? await transaction.ordOrdemServico.create({ data: dadosOrdem })
          : await transaction.ordOrdemServico.update({
              where: { cn_ordem_servico: id },
              data: { ...dadosOrdem, dt_alt: new Date() },
            })

        if (evidencias.length) {
          const where = { cn_ordem_servico: order.cn_ordem_servico }
          const count = await transaction.ordEvidenciaOs.count({ where })
          if (count + evidencias.length > MAX_ORDER_EVIDENCES)
            throw new ApiError(400, 'Uma ordem pode ter até cinco imagens.')
          await transaction.ordEvidenciaOs.createMany({
            data: evidencias.map((evidence) => ({ ...evidence, ...where })),
          })
        }

        return transaction.ordOrdemServico.findUniqueOrThrow({
          where: { cn_ordem_servico: order.cn_ordem_servico },
          include: {
            venda: { select: { cn_venda: true } },
            pessoa: true,
            itens: { orderBy: { cn_item: 'asc' } },
          },
        })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }

  manutItem(codigoOrdem: bigint, codigoItem: bigint | null, dados: IManutItemOrdemServico) {
    return this.db.$transaction(
      async (transaction) => {
        const ordem = await this.buscarOrdemEditavel(transaction, codigoOrdem)
        const existente =
          codigoItem === null
            ? null
            : await transaction.ordItemOs.findFirst({
                where: { cn_item: codigoItem, cn_ordem_servico: codigoOrdem },
              })
        if (codigoItem !== null && !existente)
          throw new ApiError(404, 'Item não encontrado nesta ordem.')
        if (
          existente &&
          existente.ca_tipo === 'SERVICO' &&
          existente.ca_status_servico !== 'PENDENTE' &&
          (dados.ca_tipo !== 'SERVICO' || dados.cn_servico !== existente.cn_servico)
        )
          throw new ApiError(
            409,
            'Não é possível substituir um serviço cuja contagem já foi iniciada.',
          )
        // Restore the previous movement before applying the new one; rollback covers both.
        if (existente?.cn_produto != null)
          await transaction.cadProduto.update({
            where: { cn_produto: existente.cn_produto },
            data: {
              qt_estoque: { increment: existente.qt_quantidade },
              dt_alt: new Date(),
            },
          })
        let descricao: string
        let unidade = ''
        if (dados.ca_tipo === 'PRODUTO') {
          const produto = await transaction.cadProduto.findUnique({
            where: { cn_produto: dados.cn_produto! },
          })
          if (!produto?.bo_sts_reg) throw new ApiError(400, 'Produto inativo ou inexistente.')
          const result = await transaction.cadProduto.updateMany({
            where: {
              cn_produto: produto.cn_produto,
              qt_estoque: { gte: dados.qt_quantidade },
            },
            data: {
              qt_estoque: { decrement: dados.qt_quantidade },
              dt_alt: new Date(),
            },
          })
          if (result.count !== 1) throw new ApiError(409, 'Estoque insuficiente para este item.')
          descricao = produto.an_nome
          unidade = produto.ca_unidade
        } else {
          const servico = await transaction.cadServico.findUnique({
            where: { cn_servico: dados.cn_servico! },
          })
          if (!servico?.bo_sts_reg) throw new ApiError(400, 'Serviço inativo ou inexistente.')
          descricao = servico.an_nome
        }
        const total = new Prisma.Decimal(dados.qt_quantidade)
          .mul(dados.vl_unitario)
          .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
        if (total.mul(100).greaterThan(Number.MAX_SAFE_INTEGER))
          throw new ApiError(400, 'Total do item excede o limite permitido.')
        const data = {
          ...dados,
          cn_ordem_servico: codigoOrdem,
          an_descr: descricao,
          ca_unidade: unidade,
          vl_total: total,
        }
        const item =
          codigoItem === null
            ? await transaction.ordItemOs.create({ data })
            : await transaction.ordItemOs.update({
                where: { cn_item: codigoItem },
                data: { ...data, dt_alt: new Date() },
              })
        const soma = await transaction.ordItemOs.aggregate({
          where: { cn_ordem_servico: codigoOrdem },
          _sum: { vl_total: true },
        })
        if (soma._sum.vl_total?.mul(100).greaterThan(Number.MAX_SAFE_INTEGER))
          throw new ApiError(400, 'Total da ordem excede o limite permitido.')
        await transaction.ordOrdemServico.update({
          where: { cn_ordem_servico: codigoOrdem },
          data: { dt_alt: new Date() },
        })
        if (
          item.ca_tipo === 'SERVICO' &&
          item.ca_status_servico === 'PENDENTE' &&
          ordem.ca_status === 'EM_ANDAMENTO'
        )
          return TempoItemOrdemServicoRepository.start(transaction, item, new Date())
        return item
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }

  manutRemoverItem(codigoOrdem: bigint, codigoItem: bigint) {
    return this.db.$transaction(
      async (transaction) => {
        await this.buscarOrdemEditavel(transaction, codigoOrdem)
        const item = await transaction.ordItemOs.findFirst({
          where: { cn_item: codigoItem, cn_ordem_servico: codigoOrdem },
        })
        if (!item) throw new ApiError(404, 'Item não encontrado nesta ordem.')
        if (item.ca_tipo === 'SERVICO' && item.ca_status_servico !== 'PENDENTE')
          throw new ApiError(409, 'Serviço com contagem iniciada não pode ser removido.')
        if (item.cn_produto !== null)
          await transaction.cadProduto.update({
            where: { cn_produto: item.cn_produto },
            data: {
              qt_estoque: { increment: item.qt_quantidade },
              dt_alt: new Date(),
            },
          })
        await transaction.ordItemOs.delete({ where: { cn_item: codigoItem } })
        await transaction.ordOrdemServico.update({
          where: { cn_ordem_servico: codigoOrdem },
          data: { dt_alt: new Date() },
        })
        return { cn_item: codigoItem.toString() }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }
  manutTempoItem(codigoOrdem: bigint, codigoItem: bigint, acao: 'INICIAR' | 'PAUSAR' | 'FINALIZAR') {
    return this.db.$transaction(
      async (transaction) => {
        const ordem = await this.buscarOrdemEditavel(transaction, codigoOrdem)
        if (ordem.ca_status !== 'EM_ANDAMENTO')
          throw new ApiError(409, 'Inicie a ordem antes de contar o tempo do serviço.')
        const item = await transaction.ordItemOs.findFirst({
          where: { cn_item: codigoItem, cn_ordem_servico: codigoOrdem },
        })
        if (!item || item.ca_tipo !== 'SERVICO')
          throw new ApiError(404, 'Item de serviço não encontrado nesta ordem.')
        if (acao === 'INICIAR') return TempoItemOrdemServicoRepository.start(transaction, item, new Date())
        if (
          (acao === 'PAUSAR' && item.ca_status_servico !== 'EM_ANDAMENTO') ||
          (acao === 'FINALIZAR' && !['EM_ANDAMENTO', 'PAUSADO'].includes(item.ca_status_servico))
        )
          throw new ApiError(409, 'Ação indisponível para o estado atual do serviço.')
        return TempoItemOrdemServicoRepository.stop(transaction, item, new Date(), acao)
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }
}

export type IOrdemServicoRepository = Pick<
  OrdemServicoRepository,
  | 'viewClassificacao'
  | 'manutClassificacao'
  | 'view'
  | 'detalhar'
  | 'paramFuncionarios'
  | 'consultarPlaca'
  | 'viewEvidencias'
  | 'manutOrdemServico'
  | 'manutMovimentar'
  | 'manutItem'
  | 'manutRemoverItem'
  | 'manutTempoItem'
>
