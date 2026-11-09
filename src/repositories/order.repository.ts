import { Prisma, type PrismaClient } from '@prisma/client'
import type {
  IManutOrder,
  IManutClassificacaoOrder,
  IManutItemOrder,
  IFiltroOrder,
  IMovimentoOrder,
} from '../interfaces/order.js'
import { ApiError } from '../interfaces/error.js'
import { OrderTimeRepository } from './order-time.repository.js'

export class OrderRepository {
  constructor(private readonly db: PrismaClient) {}

  classificationList() {
    return this.db.ordClassificacaoOs.findMany({
      orderBy: { cn_classificacao_os: 'asc' },
    })
  }

  saveClassification(id: bigint | null, values: IManutClassificacaoOrder) {
    return this.db.$transaction(
      async (transaction) => {
        if (values.bo_padrao)
          await transaction.ordClassificacaoOs.updateMany({
            where: { bo_padrao: true },
            data: { bo_padrao: false, dt_alt: new Date() },
          })
        return id === null
          ? transaction.ordClassificacaoOs.create({ data: values })
          : transaction.ordClassificacaoOs.update({
              where: { cn_classificacao_os: id },
              data: { ...values, dt_alt: new Date() },
            })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }

  async list(page: number, limit: number, search: string, filters: IFiltroOrder = {}) {
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

  findById(id: bigint) {
    return this.db.ordOrdemServico.findUnique({
      where: { cn_ordem_servico: id },
      include: {
        venda: { select: { cn_venda: true } },
        pessoa: true,
        itens: { orderBy: { cn_item: 'asc' } },
      },
    })
  }

  private async editable(transaction: Prisma.TransactionClient, id: bigint) {
    const ordem = await transaction.ordOrdemServico.findUnique({
      where: { cn_ordem_servico: id },
    })
    if (!ordem) throw new ApiError(404, 'Ordem de serviço não encontrada.')
    if (ordem.ca_status === 'FINALIZADO' || ordem.ca_status === 'CANCELADO')
      throw new ApiError(409, 'Esta ordem está encerrada e permite apenas consulta.')
    return ordem
  }

  move(id: bigint, values: IMovimentoOrder) {
    return this.db.$transaction(
      async (transaction) => {
        const ordem = await this.editable(transaction, id)
        if (
          (values.acao === 'INICIAR' && ordem.ca_status !== 'ABERTO') ||
          (values.acao === 'FINALIZAR' && ordem.ca_status !== 'EM_ANDAMENTO')
        )
          throw new ApiError(409, 'Ação indisponível para o status atual da ordem.')
        const agora = new Date()
        const servicos = await transaction.ordItemOs.findMany({
          where: { cn_ordem_servico: id, ca_tipo: 'SERVICO' },
        })
        for (const item of servicos) {
          if (values.acao === 'INICIAR' && item.ca_status_servico === 'PENDENTE')
            await OrderTimeRepository.start(transaction, item, agora)
          if (values.acao !== 'INICIAR' && item.ca_status_servico !== 'FINALIZADO')
            await OrderTimeRepository.stop(transaction, item, agora, values.acao)
        }
        const data =
          values.acao === 'INICIAR'
            ? { ca_status: 'EM_ANDAMENTO', dt_inicio: agora }
            : values.acao === 'FINALIZAR'
              ? { ca_status: 'FINALIZADO', dt_finalizacao: agora }
              : {
                  ca_status: 'CANCELADO',
                  dt_cancelamento: agora,
                  an_motivo_cancelamento: values.an_motivo_cancelamento,
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

  saveOrder(id: bigint | null, values: IManutOrder) {
    return this.db.$transaction(
      async (transaction) => {
        if (id !== null) await this.editable(transaction, id)
        const pessoa = await transaction.cadPessoa.findUnique({
          where: { cn_pessoa: values.cn_pessoa },
        })
        if (!pessoa?.bo_sts_reg || !pessoa.bo_categ_cliente)
          throw new ApiError(400, 'Selecione um cliente ativo.')
        const status = await transaction.ordClassificacaoOs.findUnique({
          where: { cn_classificacao_os: values.cn_classificacao_os },
        })
        if (!status?.bo_sts_reg) throw new ApiError(400, 'Selecione uma classificação ativa.')
        return id === null
          ? transaction.ordOrdemServico.create({
              data: { ...values, ca_status: 'ABERTO' },
              include: {
                venda: { select: { cn_venda: true } },
                pessoa: true,
                itens: true,
              },
            })
          : transaction.ordOrdemServico.update({
              where: { cn_ordem_servico: id },
              data: { ...values, dt_alt: new Date() },
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

  saveItem(ordemId: bigint, itemId: bigint | null, values: IManutItemOrder) {
    return this.db.$transaction(
      async (transaction) => {
        const ordem = await this.editable(transaction, ordemId)
        const existing =
          itemId === null
            ? null
            : await transaction.ordItemOs.findFirst({
                where: { cn_item: itemId, cn_ordem_servico: ordemId },
              })
        if (itemId !== null && !existing)
          throw new ApiError(404, 'Item não encontrado nesta ordem.')
        if (
          existing &&
          existing.ca_tipo === 'SERVICO' &&
          existing.ca_status_servico !== 'PENDENTE' &&
          (values.ca_tipo !== 'SERVICO' || values.cn_servico !== existing.cn_servico)
        )
          throw new ApiError(
            409,
            'Não é possível substituir um serviço cuja contagem já foi iniciada.',
          )
        // Restore the previous movement before applying the new one; rollback covers both.
        if (existing?.cn_produto != null)
          await transaction.cadProduto.update({
            where: { cn_produto: existing.cn_produto },
            data: {
              qt_estoque: { increment: existing.qt_quantidade },
              dt_alt: new Date(),
            },
          })
        let descricao: string
        let unidade = ''
        if (values.ca_tipo === 'PRODUTO') {
          const produto = await transaction.cadProduto.findUnique({
            where: { cn_produto: values.cn_produto! },
          })
          if (!produto?.bo_sts_reg) throw new ApiError(400, 'Produto inativo ou inexistente.')
          const result = await transaction.cadProduto.updateMany({
            where: {
              cn_produto: produto.cn_produto,
              qt_estoque: { gte: values.qt_quantidade },
            },
            data: {
              qt_estoque: { decrement: values.qt_quantidade },
              dt_alt: new Date(),
            },
          })
          if (result.count !== 1) throw new ApiError(409, 'Estoque insuficiente para este item.')
          descricao = produto.an_nome
          unidade = produto.ca_unidade
        } else {
          const servico = await transaction.cadServico.findUnique({
            where: { cn_servico: values.cn_servico! },
          })
          if (!servico?.bo_sts_reg) throw new ApiError(400, 'Serviço inativo ou inexistente.')
          descricao = servico.an_nome
        }
        const total = new Prisma.Decimal(values.qt_quantidade)
          .mul(values.vl_unitario)
          .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
        if (total.mul(100).greaterThan(Number.MAX_SAFE_INTEGER))
          throw new ApiError(400, 'Total do item excede o limite permitido.')
        const data = {
          ...values,
          cn_ordem_servico: ordemId,
          an_descr: descricao,
          ca_unidade: unidade,
          vl_total: total,
        }
        const item =
          itemId === null
            ? await transaction.ordItemOs.create({ data })
            : await transaction.ordItemOs.update({
                where: { cn_item: itemId },
                data: { ...data, dt_alt: new Date() },
              })
        const soma = await transaction.ordItemOs.aggregate({
          where: { cn_ordem_servico: ordemId },
          _sum: { vl_total: true },
        })
        if (soma._sum.vl_total?.mul(100).greaterThan(Number.MAX_SAFE_INTEGER))
          throw new ApiError(400, 'Total da ordem excede o limite permitido.')
        await transaction.ordOrdemServico.update({
          where: { cn_ordem_servico: ordemId },
          data: { dt_alt: new Date() },
        })
        if (
          item.ca_tipo === 'SERVICO' &&
          item.ca_status_servico === 'PENDENTE' &&
          ordem.ca_status === 'EM_ANDAMENTO'
        )
          return OrderTimeRepository.start(transaction, item, new Date())
        return item
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }

  removeItem(ordemId: bigint, itemId: bigint) {
    return this.db.$transaction(
      async (transaction) => {
        await this.editable(transaction, ordemId)
        const item = await transaction.ordItemOs.findFirst({
          where: { cn_item: itemId, cn_ordem_servico: ordemId },
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
        await transaction.ordItemOs.delete({ where: { cn_item: itemId } })
        await transaction.ordOrdemServico.update({
          where: { cn_ordem_servico: ordemId },
          data: { dt_alt: new Date() },
        })
        return { cn_item: itemId.toString() }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }
  timeItem(ordemId: bigint, itemId: bigint, acao: 'INICIAR' | 'PAUSAR' | 'FINALIZAR') {
    return this.db.$transaction(
      async (transaction) => {
        const ordem = await this.editable(transaction, ordemId)
        if (ordem.ca_status !== 'EM_ANDAMENTO')
          throw new ApiError(409, 'Inicie a ordem antes de contar o tempo do serviço.')
        const item = await transaction.ordItemOs.findFirst({
          where: { cn_item: itemId, cn_ordem_servico: ordemId },
        })
        if (!item || item.ca_tipo !== 'SERVICO')
          throw new ApiError(404, 'Item de serviço não encontrado nesta ordem.')
        if (acao === 'INICIAR') return OrderTimeRepository.start(transaction, item, new Date())
        if (
          (acao === 'PAUSAR' && item.ca_status_servico !== 'EM_ANDAMENTO') ||
          (acao === 'FINALIZAR' && !['EM_ANDAMENTO', 'PAUSADO'].includes(item.ca_status_servico))
        )
          throw new ApiError(409, 'Ação indisponível para o estado atual do serviço.')
        return OrderTimeRepository.stop(transaction, item, new Date(), acao)
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }
}

export type IOrderRepository = Pick<
  OrderRepository,
  | 'classificationList'
  | 'saveClassification'
  | 'list'
  | 'findById'
  | 'saveOrder'
  | 'move'
  | 'saveItem'
  | 'removeItem'
  | 'timeItem'
>
