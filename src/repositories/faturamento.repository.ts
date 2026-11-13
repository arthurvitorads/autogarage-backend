import { Prisma, type PrismaClient } from '@prisma/client'
import type { IManutVenda } from '../interfaces/faturamento.js'
import { ApiError } from '../interfaces/error.js'
import { createHash } from 'node:crypto'

export class FaturamentoRepository {
  constructor(private readonly db: PrismaClient) {}

  async list(page: number, limit: number, search: string) {
    const where: Prisma.FatVendaWhereInput = search
      ? {
          OR: [
            { an_cliente: { contains: search, mode: 'insensitive' } },
            { ca_documento: { contains: search } },
            ...(/^\d+$/.test(search) && Number(search) <= 2147483647
              ? [{ nu_numero: Number(search) }]
              : []),
          ],
        }
      : {}
    const [vendas, total] = await this.db.$transaction([
      this.db.fatVenda.findMany({
        where,
        include: { itens: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nu_numero: 'desc' },
      }),
      this.db.fatVenda.count({ where }),
    ])
    return { vendas, total }
  }

  findById(id: bigint) {
    return this.db.fatVenda.findUnique({
      where: { cn_venda: id },
      include: { itens: true },
    })
  }

  create(values: IManutVenda, uid: string) {
    const hash = createHash('sha256')
      .update(
        JSON.stringify(values, (_key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        ),
      )
      .digest('hex')
    return this.db.$transaction(
      async (transaction) => {
        const repetida = await transaction.fatVenda.findUnique({
          where: { ca_chave_requisicao: values.ca_chave_requisicao },
          include: { itens: true },
        })
        if (repetida) {
          if (repetida.ca_id_firebase !== uid || repetida.ca_hash_requisicao !== hash)
            throw new ApiError(409, 'Chave da requisição já utilizada em outra venda.')
          return repetida
        }
        const pessoa = await transaction.cadPessoa.findUnique({
          where: { cn_pessoa: values.cn_pessoa },
          include: { endereco: { include: { estado: { select: { ca_uf: true } } } } },
        })
        if (!pessoa) throw new ApiError(404, 'Cliente não encontrado.')
        const itens: Prisma.FatItemVendaUncheckedCreateWithoutVendaInput[] = []
        if (values.cn_ordem_servico) {
          const ordem = await transaction.ordOrdemServico.findUnique({
            where: { cn_ordem_servico: values.cn_ordem_servico },
            include: { itens: { include: { produto: true } }, venda: true },
          })
          if (!ordem || ordem.ca_status !== 'FINALIZADO' || !ordem.itens.length)
            throw new ApiError(409, 'A O.S. deve estar finalizada e conter itens para gerar venda.')
          if (ordem.venda) throw new ApiError(409, 'Esta O.S. já possui uma venda registrada.')
          if (ordem.cn_pessoa !== values.cn_pessoa)
            throw new ApiError(400, 'O cliente deve ser o mesmo da O.S.')
          for (const item of ordem.itens) {
            itens.push({
              cn_item_os: item.cn_item,
              ca_tipo: item.ca_tipo,
              cn_produto: item.cn_produto,
              cn_servico: item.cn_servico,
              an_descr: item.an_descr,
              ca_unidade: item.ca_unidade,
              qt_quantidade: item.qt_quantidade,
              vl_unitario: item.vl_unitario,
              vl_total: item.vl_total,
              vl_custo: item.produto?.vl_custo ?? 0,
              qt_tempo_segundos: item.qt_tempo_segundos,
            })
          }
        } else {
          if (!pessoa.bo_sts_reg || !pessoa.bo_categ_cliente)
            throw new ApiError(400, 'Selecione um cliente ativo.')
          // Ordem fixa de produtos reduz conflitos entre vendas concorrentes.
          const entrada = values.itens
            .slice()
            .sort((a, b) => (a.cn_produto ?? 0) - (b.cn_produto ?? 0))
          for (const item of entrada) {
            let descricao: string
            let unidade = ''
            let custo: Prisma.Decimal | number = 0
            if (item.ca_tipo === 'PRODUTO') {
              const produto = await transaction.cadProduto.findUnique({
                where: { cn_produto: item.cn_produto! },
              })
              if (!produto?.bo_sts_reg) throw new ApiError(400, 'Produto inativo ou inexistente.')
              const saldo = await transaction.cadProduto.updateMany({
                where: {
                  cn_produto: produto.cn_produto,
                  qt_estoque: { gte: item.qt_quantidade },
                },
                data: {
                  qt_estoque: { decrement: item.qt_quantidade },
                  dt_alt: new Date(),
                },
              })
              if (saldo.count !== 1)
                throw new ApiError(409, 'Estoque insuficiente para ' + produto.an_nome + '.')
              descricao = produto.an_nome
              unidade = produto.ca_unidade
              custo = produto.vl_custo
            } else {
              const servico = await transaction.cadServico.findUnique({
                where: { cn_servico: item.cn_servico! },
              })
              if (!servico?.bo_sts_reg) throw new ApiError(400, 'Serviço inativo ou inexistente.')
              descricao = servico.an_nome
            }
            itens.push({
              ...item,
              an_descr: descricao,
              ca_unidade: unidade,
              vl_custo: custo,
              vl_total: new Prisma.Decimal(item.qt_quantidade)
                .mul(item.vl_unitario)
                .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP),
            })
          }
        }
        const total = itens.reduce(
          (soma, item) => soma.add(item.vl_total as Prisma.Decimal.Value),
          new Prisma.Decimal(0),
        )
        if (total.mul(100).greaterThan(Number.MAX_SAFE_INTEGER))
          throw new ApiError(400, 'Total da venda excede o limite permitido.')
        const endereco = pessoa.endereco
        return transaction.fatVenda.create({
          data: {
            cn_pessoa: pessoa.cn_pessoa,
            cn_ordem_servico: values.cn_ordem_servico,
            ca_origem: values.cn_ordem_servico ? 'ORDEM_SERVICO' : 'DIRETA',
            an_cliente: pessoa.an_nome ?? pessoa.an_razao_social ?? '',
            ca_documento: pessoa.ca_cpf ?? pessoa.ca_cnpj ?? '',
            an_email: pessoa.an_email ?? '',
            an_telefone: pessoa.an_telefone ?? '',
            an_endereco: endereco
              ? [
                  endereco.an_logradouro,
                  endereco.an_numero,
                  endereco.an_complemento,
                  endereco.an_bairro,
                  endereco.an_cidade,
                  endereco.estado?.ca_uf,
                  endereco.ca_cep,
                ]
                  .filter(Boolean)
                  .join(', ')
              : '',
            an_obs: values.an_obs,
            ca_id_firebase: uid,
            ca_chave_requisicao: values.ca_chave_requisicao,
            ca_hash_requisicao: hash,
            vl_total: total,
            itens: { create: itens },
          },
          include: { itens: true },
        })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }
}

export type IFaturamentoRepository = Pick<FaturamentoRepository, 'list' | 'findById' | 'create'>
