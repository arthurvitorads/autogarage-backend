import test from 'node:test'
import assert from 'node:assert/strict'
import { Prisma, type PrismaClient, type OrdItemOs } from '@prisma/client'
import { OrderTimeRepository } from '../src/repositories/order-time.repository.js'
import { OrderRepository } from '../src/repositories/order.repository.js'
import { FaturamentoRepository } from '../src/repositories/faturamento.repository.js'
import { FaturamentoValidator } from '../src/validators/faturamento.validator.js'
import { OrderValidator } from '../src/validators/order.validator.js'
import { RelatorioRepository } from '../src/repositories/relatorio.repository.js'

function tempoDatabase() {
  let item = { cn_item: 1n, cn_ordem_servico: 1n, cn_servico: 1, ca_tipo: 'SERVICO', ca_status_servico: 'PENDENTE', qt_tempo_segundos: 0, dt_inicio_tempo: null } as OrdItemOs
  const intervalos: any[] = []
  let status = 'EM_ANDAMENTO'
  const transaction = {
    ordOrdemServico: {
      findUnique: async () => ({ cn_ordem_servico: 1n, ca_status: status }),
      update: async ({ data }: any) => { if (data.ca_status) status = data.ca_status; return { ca_status: status, itens: [item] } },
    },
    cadServico: { findUnique: async () => ({ an_nome: 'Troca de óleo', bo_sts_reg: true }) },
    ordItemOs: {
      aggregate: async () => ({ _sum: { vl_total: new Prisma.Decimal(60) } }),
      findFirst: async ({ where }: any) => where.cn_item === item.cn_item && where.cn_ordem_servico === 1n ? { ...item } : null,
      findMany: async () => [{ ...item }],
      update: async ({ data }: any) => {
        item = { ...item, ...data, qt_tempo_segundos: item.qt_tempo_segundos + (data.qt_tempo_segundos?.increment ?? 0) }
        return { ...item }
      },
    },
    ordTempoItemOs: {
      create: async ({ data }: any) => { intervalos.push({ ...data, dt_fim: null }); return data },
      updateMany: async ({ data }: any) => {
        const abertos = intervalos.filter(intervalo => intervalo.dt_fim === null)
        abertos.forEach(intervalo => Object.assign(intervalo, data))
        return { count: abertos.length }
      },
    },
  }
  const db = { $transaction: (callback: any) => callback(transaction) } as PrismaClient
  return { transaction: transaction as unknown as Prisma.TransactionClient, repository: new OrderRepository(db), item: () => ({ ...item }), intervalos,
    setStatus: (value: string) => { status = value } }
}

test('tempo: persiste intervalos, exclui pausas e mantém contagem ao retomar', async () => {
  const db = tempoDatabase()
  const inicio = new Date('2026-11-03T10:00:00Z')
  await OrderTimeRepository.start(db.transaction, db.item(), inicio)
  await assert.rejects(() => OrderTimeRepository.start(db.transaction, db.item(), inicio), /estado atual/)
  await OrderTimeRepository.stop(db.transaction, db.item(), new Date('2026-11-03T10:02:05Z'), 'PAUSAR')
  assert.equal(db.item().qt_tempo_segundos, 125)
  assert.equal(db.item().dt_inicio_tempo, null)
  await OrderTimeRepository.start(db.transaction, db.item(), new Date('2026-11-03T10:10:00Z'))
  await OrderTimeRepository.stop(db.transaction, db.item(), new Date('2026-11-03T10:11:00Z'), 'FINALIZAR')
  assert.equal(db.item().qt_tempo_segundos, 185)
  assert.equal(db.item().ca_status_servico, 'FINALIZADO')
  assert.deepEqual(db.intervalos.map(item => item.qt_segundos), [125, 60])
  assert.equal(db.intervalos.filter(item => !item.dt_fim).length, 0)
})

test('tempo: finalizar a O.S. fecha o intervalo aberto e bloqueia ações futuras', async () => {
  const db = tempoDatabase()
  await db.repository.timeItem(1n, 1n, 'INICIAR')
  await db.repository.move(1n, { acao: 'FINALIZAR', an_motivo_cancelamento: '' })
  assert.equal(db.item().ca_status_servico, 'FINALIZADO')
  assert.ok(db.intervalos[0].dt_fim)
  await assert.rejects(() => db.repository.timeItem(1n, 1n, 'INICIAR'), /encerrada/)
})

test('tempo: não aceita produto, item de outra O.S., pausa duplicada ou ordem aberta', async () => {
  const db = tempoDatabase()
  await assert.rejects(() => db.repository.timeItem(2n, 1n, 'INICIAR'), /não encontrado/)
  await assert.rejects(() => db.repository.timeItem(1n, 1n, 'PAUSAR'), /estado atual/)
  db.setStatus('ABERTO')
  await assert.rejects(() => db.repository.timeItem(1n, 1n, 'INICIAR'), /Inicie a ordem/)
  await assert.rejects(() => OrderTimeRepository.start(db.transaction, { ...db.item(), ca_tipo: 'PRODUTO' }, new Date()), /estado atual/)
  assert.throws(() => OrderValidator.time({ acao: 'ALTERAR' }))
})

function vendaDatabase(status = 'FINALIZADO', comItens = true) {
  let saldo = new Prisma.Decimal(5)
  let vendas: any[] = []
  const produto = { cn_produto: 1, an_nome: 'Filtro', ca_unidade: 'UN', vl_custo: new Prisma.Decimal(10), bo_sts_reg: true }
  const origem = { cn_item: 1n, ca_tipo: 'PRODUTO', cn_produto: 1, cn_servico: null, an_descr: 'Filtro original', ca_unidade: 'UN',
    qt_quantidade: new Prisma.Decimal(2), vl_unitario: new Prisma.Decimal(20), vl_total: new Prisma.Decimal(40), qt_tempo_segundos: 0, produto }
  const transaction = {
    fatVenda: {
      findUnique: async ({ where }: any) => vendas.find(venda => venda.ca_chave_requisicao === where.ca_chave_requisicao) ?? null,
      create: async ({ data }: any) => {
        const venda = { ...data, cn_venda: BigInt(vendas.length + 1), itens: data.itens.create.map((item: any, index: number) => ({ ...item, cn_item_venda: BigInt(index + 1), cn_venda: BigInt(vendas.length + 1) })) }
        vendas.push(venda)
        return venda
      },
    },
    cadPessoa: { findUnique: async () => ({ cn_pessoa: 1n, an_nome: 'Marina Duarte', ca_cpf: '123', an_email: 'marina@garagemaurora.test', bo_sts_reg: true, bo_categ_cliente: true, endereco: { an_cidade: 'São Paulo' } }) },
    cadProduto: {
      findUnique: async () => produto,
      updateMany: async ({ where, data }: any) => {
        if (saldo.lessThan(where.qt_estoque.gte)) return { count: 0 }
        saldo = saldo.sub(data.qt_estoque.decrement)
        return { count: 1 }
      },
    },
    cadServico: { findUnique: async () => ({ an_nome: 'Troca', bo_sts_reg: true }) },
    ordOrdemServico: { findUnique: async () => ({ ca_status: status, cn_pessoa: 1n, venda: vendas.find(venda => venda.cn_ordem_servico === 1n) ?? null, itens: comItens ? [origem] : [] }) },
  }
  const db = { $transaction: async (callback: any) => {
    const anterior = { saldo, vendas: vendas.slice() }
    try { return await callback(transaction) } catch (error) { saldo = anterior.saldo; vendas = anterior.vendas; throw error }
  } } as PrismaClient
  return { repository: new FaturamentoRepository(db), saldo: () => saldo.toNumber(), vendas: () => vendas }
}

const base = { cn_pessoa: '1', an_obs: '', ca_chave_requisicao: '0f2fa8c1-2638-4c42-83aa-d19110ad7e10' }
const item = { ca_tipo: 'PRODUTO', cn_produto: 1, qt_quantidade: 2, vl_unitario: 20 }

test('venda direta: grava cliente e itens, calcula total e debita estoque uma vez no retry', async () => {
  const db = vendaDatabase()
  const values = FaturamentoValidator.create({ ...base, itens: [item] })
  const venda = await db.repository.create(values, 'usuario-1')
  assert.equal(db.saldo(), 3)
  assert.equal(Number(venda.vl_total), 40)
  assert.equal(venda.an_cliente, 'Marina Duarte')
  assert.equal(venda.itens[0]?.an_descr, 'Filtro')
  const repetida = await db.repository.create(values, 'usuario-1')
  assert.equal(repetida.cn_venda, venda.cn_venda)
  assert.equal(db.vendas().length, 1)
  assert.equal(db.saldo(), 3)
  await assert.rejects(() => db.repository.create({ ...values, an_obs: 'outro conteúdo' }, 'usuario-1'), /outra venda/)
})

test('venda direta: falta de saldo em um item desfaz todos os débitos e não grava venda', async () => {
  const db = vendaDatabase()
  const values = FaturamentoValidator.create({ ...base, itens: [item, { ...item, qt_quantidade: 4 }] })
  await assert.rejects(() => db.repository.create(values, 'usuario-1'), /Estoque insuficiente/)
  assert.equal(db.saldo(), 5)
  assert.equal(db.vendas().length, 0)
})

test('venda por O.S.: copia itens sem nova baixa e impede faturamento duplicado', async () => {
  const db = vendaDatabase()
  const values = FaturamentoValidator.create({ ...base, cn_ordem_servico: '1' })
  const venda = await db.repository.create(values, 'usuario-1')
  assert.equal(db.saldo(), 5)
  assert.equal(venda.itens[0]?.cn_item_os, 1n)
  assert.equal(venda.itens[0]?.an_descr, 'Filtro original')
  await assert.rejects(() => db.repository.create({ ...values, ca_chave_requisicao: '6d746c8f-290c-42a4-a9a9-a7e75d73d559' }, 'usuario-1'), /já possui/)
})

test('venda por O.S.: rejeita ordens abertas, canceladas, sem itens e cliente divergente', async () => {
  for (const status of ['ABERTO', 'EM_ANDAMENTO', 'CANCELADO']) {
    const db = vendaDatabase(status)
    await assert.rejects(() => db.repository.create(FaturamentoValidator.create({ ...base, cn_ordem_servico: '1' }), 'usuario-1'), /finalizada/)
  }
  const db = vendaDatabase('FINALIZADO', false)
  await assert.rejects(() => db.repository.create(FaturamentoValidator.create({ ...base, cn_ordem_servico: '1' }), 'usuario-1'), /conter itens/)
  const outraPessoa = vendaDatabase()
  await assert.rejects(() => outraPessoa.repository.create(FaturamentoValidator.create({ ...base, cn_pessoa: '2', cn_ordem_servico: '1' }), 'usuario-1'), /mesmo da O.S./)
})

test('validação FAT: rejeita lista vazia, preço inválido, itens alterados de O.S. e período inválido', () => {
  assert.throws(() => FaturamentoValidator.create({ ...base, itens: [] }))
  assert.throws(() => FaturamentoValidator.create({ ...base, itens: [{ ...item, vl_unitario: -1 }] }))
  assert.throws(() => FaturamentoValidator.create({ ...base, cn_ordem_servico: '1', itens: [item] }))
  assert.throws(() => FaturamentoValidator.filters({ inicio: '2026-11-03', fim: '2026-11-02' }))
})

test('relatórios: tempo e contagem usam o mesmo período, excluem ordens canceladas e ordenam rápido/longo', async () => {
  let consulta: any
  let contagem: any
  const db = {
    ordItemOs: {
      findMany: async (args: any) => { consulta = args; return [] },
      count: async (args: any) => { contagem = args; return 0 },
      aggregate: async () => ({ _avg: {}, _min: {}, _max: {} }),
    },
    $transaction: (requests: any[]) => Promise.all(requests),
  } as PrismaClient
  const filtro = FaturamentoValidator.filters({ inicio: '2026-11-01T03:00:00Z', fim: '2026-12-01T02:59:59Z', ordem: 'asc' })
  await new RelatorioRepository(db).tempos(2, 20, filtro)
  assert.deepEqual(consulta.where, contagem.where)
  assert.equal(consulta.where.ordem.ca_status, 'FINALIZADO')
  assert.equal(consulta.where.ca_status_servico, 'FINALIZADO')
  assert.deepEqual(consulta.orderBy[0], { qt_tempo_segundos: 'asc' })
  assert.equal(consulta.skip, 20)
})

import Fastify from 'fastify'
import { ApiResponse } from '../src/http/api-response.js'
import { ApiRouter } from '../src/http/api-router.js'
import { AuthMiddleware } from '../src/middlewares/auth.middleware.js'
import type { AuthService } from '../src/services/auth.service.js'
import { FaturamentoController } from '../src/controllers/faturamento.controller.js'
import { FaturamentoService } from '../src/services/faturamento.service.js'
import { FaturamentoRoutes } from '../src/routes/faturamento.route.js'

test('rota FAT: exige autenticação, retorna IDs em texto e preserva dados internos', async () => {
  const app = Fastify()
  app.setErrorHandler(ApiResponse.error)
  const db = vendaDatabase()
  const auth = { authenticate: async (authorization: string) => {
    if (authorization !== 'Bearer teste') throw Object.assign(new Error('Token inválido'), { statusCode: 401 })
    return { uid: 'usuario-1' }
  } } as unknown as AuthService
  new FaturamentoRoutes(new FaturamentoController(new FaturamentoService(db.repository))).register(new ApiRouter(app, new AuthMiddleware(auth)))
  try {
    const unauthorized = await app.inject({ method: 'POST', url: '/faturamento/vendas', payload: { ...base, itens: [item] } })
    assert.equal(unauthorized.statusCode, 401)
    const response = await app.inject({ method: 'POST', url: '/faturamento/vendas', headers: { authorization: 'Bearer teste' }, payload: { ...base, itens: [item] } })
    assert.equal(response.statusCode, 201)
    const result = response.json()
    assert.equal(result.sucesso, true)
    assert.equal(result.dados.cn_venda, '1')
    assert.equal(result.dados.vl_total, 40)
    assert.equal(result.dados.ca_id_firebase, undefined)
    assert.equal(result.dados.ca_hash_requisicao, undefined)
    assert.equal(result.dados.ca_chave_requisicao, undefined)
  } finally {
    await app.close()
  }
})

test('tempo: corrigir quantidade/preço preserva relógio e impede substituir serviço já iniciado', async () => {
  const db = tempoDatabase()
  await db.repository.timeItem(1n, 1n, 'INICIAR')
  const inicio = db.item().dt_inicio_tempo
  const values = { ca_tipo: 'SERVICO' as const, cn_servico: 1, cn_produto: null, qt_quantidade: 2, vl_unitario: 30 }
  await db.repository.saveItem(1n, 1n, values)
  assert.equal(db.item().dt_inicio_tempo, inicio)
  assert.equal(db.item().ca_status_servico, 'EM_ANDAMENTO')
  assert.equal(db.intervalos.length, 1)
  await assert.rejects(() => db.repository.saveItem(1n, 1n, { ...values, cn_servico: 2 }), /substituir/)
})
