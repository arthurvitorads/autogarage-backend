import test from 'node:test'
import assert from 'node:assert/strict'
import { Prisma, type PrismaClient } from '@prisma/client'
import { PersonValidator } from '../src/validators/person.validator.js'
import { CatalogValidator } from '../src/validators/catalog.validator.js'
import { OrderValidator } from '../src/validators/order.validator.js'
import { DataValidator } from '../src/validators/data.validator.js'
import { UserController } from '../src/controllers/user.controller.js'
import { UserService } from '../src/services/user.service.js'
import { PersonController } from '../src/controllers/person.controller.js'
import { PersonService } from '../src/services/person.service.js'
import { PersonRoutes } from '../src/routes/person.route.js'
import { CatalogController } from '../src/controllers/catalog.controller.js'
import { CatalogService } from '../src/services/catalog.service.js'
import { CatalogRoutes } from '../src/routes/catalog.route.js'
import { OrderController } from '../src/controllers/order.controller.js'
import { OrderService } from '../src/services/order.service.js'
import { OrderRoutes } from '../src/routes/order.route.js'
import { OrderRepository } from '../src/repositories/order.repository.js'
import { ApiRouter } from '../src/http/api-router.js'
import { ApiResponse } from '../src/http/api-response.js'
import { AuthMiddleware } from '../src/middlewares/auth.middleware.js'
import type { AuthService } from '../src/services/auth.service.js'
import type { IPersonRepository } from '../src/repositories/person.repository.js'
import type { ICatalogRepository } from '../src/repositories/catalog.repository.js'
import type { IOrderRepository } from '../src/repositories/order.repository.js'
import type { FastifyRequest } from 'fastify'
import Fastify from 'fastify'

const pessoa = {
  ca_tipo: 'PF', an_nome: 'Pessoa de teste', ca_cpf: '529.982.247-25', an_email: 'TESTE@example.com', an_telefone: '(11) 99999-9999',
  bo_categ_cliente: true, bo_categ_func: false, bo_sts_reg: true,
  endereco: { ca_cep: '01001-000', an_logradouro: 'Praça da Sé', an_numero: '1', an_complemento: '', an_bairro: 'Sé', an_cidade: 'São Paulo', ca_uf: 'sp' },
}
const produto = { an_nome: 'Filtro', an_referencia: '', an_categoria: '', an_marca: '', ca_unidade: 'UN',
  vl_custo: 10, vl_venda: 20, qt_estoque: 5, qt_estoque_min: 1, an_obs: '', bo_sts_reg: true }
const ordem = { cn_pessoa: '1', cn_status: '1', dt_entrada: '2026-10-28T10:00:00-03:00', dt_previsao: null,
  an_responsavel: '', an_solicitacao: '', an_obs: '',
  veiculo: { an_placa: 'abc-1234', an_marca: 'Marca', an_modelo: 'Modelo', nu_ano: null, an_cor: '', qt_quilometragem: null } }
const item = { ca_tipo: 'PRODUTO' as const, cn_produto: 1, cn_servico: null, qt_quantidade: 2, vl_unitario: 19.95 }

test('pessoas: normaliza documento, contato e endereço, e limpa campos do outro tipo', () => {
  const values = PersonValidator.parse({ ...pessoa, ca_cnpj: 'ignorar' })
  assert.equal(values.ca_cpf, '52998224725')
  assert.equal(values.ca_cnpj, null)
  assert.equal(values.an_email, 'teste@example.com')
  assert.equal(values.endereco.ca_cep, '01001000')
  assert.equal(values.endereco.ca_uf, 'SP')
  assert.equal(values.an_telefone, '11999999999')
  assert.equal(PersonValidator.document('11222333000181', 'PJ'), true)
})

test('pessoas: rejeita documentos, categorias, endereço e comissão inválidos', () => {
  for (const values of [
    { ...pessoa, ca_cpf: '11111111111' },
    { ...pessoa, bo_categ_cliente: false },
    { ...pessoa, endereco: { ...pessoa.endereco, ca_uf: 'XX' } },
    { ...pessoa, bo_categ_func: true, nm_comissao_percentual: 101 },
  ]) assert.throws(() => PersonValidator.parse(values))
})

test('catálogo: rejeita estoque negativo, frações inválidas e tipo auxiliar desconhecido', () => {
  assert.throws(() => CatalogValidator.product({ ...produto, qt_estoque: -1 }))
  assert.throws(() => CatalogValidator.product({ ...produto, qt_estoque: 1.1234 }))
  assert.throws(() => CatalogValidator.product({ ...produto, vl_venda: 1.234 }))
  assert.throws(() => CatalogValidator.auxiliary({ ca_tipo: 'INVALIDO', an_descr: 'Teste' }))
  assert.equal(CatalogValidator.service({ an_nome: 'Serviço', vl_preco: 10, an_obs: '', bo_sts_reg: true }).nu_tempo_estimado, null)
})

test('ordens: normaliza placa, preserva fuso e rejeita previsão anterior à entrada', () => {
  const values = OrderValidator.order(ordem)
  assert.equal(values.an_placa, 'ABC1234')
  assert.equal(values.dt_entrada.toISOString(), '2026-10-28T13:00:00.000Z')
  assert.throws(() => OrderValidator.order({ ...ordem, dt_previsao: '2026-10-27T13:00:00Z' }))
  assert.throws(() => OrderValidator.item({ ...item, qt_quantidade: 0 }))
  assert.throws(() => DataValidator.id(Number.MAX_SAFE_INTEGER + 1))
  assert.equal(DataValidator.id('9223372036854775807'), 9223372036854775807n)
})

function database() {
  let saldo = new Prisma.Decimal(5)
  let itens: Array<Record<string, unknown>> = []
  const transaction = {
    ordOrdemServico: {
      findUnique: async () => ({ cn_ordem_servico: 1n }),
      update: async () => ({}),
    },
    cadProduto: {
      findUnique: async () => ({ cn_produto: 1, an_nome: 'Filtro', ca_unidade: 'UN', bo_sts_reg: true }),
      update: async ({ data }: { data: { qt_estoque: { increment: Prisma.Decimal } } }) => {
        saldo = saldo.add(data.qt_estoque.increment)
        return {}
      },
      updateMany: async ({ where, data }: { where: { qt_estoque: { gte: number } }; data: { qt_estoque: { decrement: number } } }) => {
        if (saldo.lessThan(where.qt_estoque.gte)) return { count: 0 }
        saldo = saldo.sub(data.qt_estoque.decrement)
        return { count: 1 }
      },
    },
    cadServico: { findUnique: async () => ({ cn_servico: 1, an_nome: 'Troca', bo_sts_reg: true }) },
    ordItemOs: {
      findFirst: async ({ where }: { where: { cn_item: bigint; cn_ordem_servico: bigint } }) =>
        itens.find(row => row.cn_item === where.cn_item && row.cn_ordem_servico === where.cn_ordem_servico) ?? null,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row = { ...data, cn_item: BigInt(itens.length + 1) }
        itens.push(row)
        return row
      },
      update: async ({ where, data }: { where: { cn_item: bigint }; data: Record<string, unknown> }) => {
        const index = itens.findIndex(row => row.cn_item === where.cn_item)
        itens[index] = { ...itens[index], ...data }
        return itens[index]
      },
      delete: async ({ where }: { where: { cn_item: bigint } }) => { itens = itens.filter(row => row.cn_item !== where.cn_item) },
      aggregate: async () => ({ _sum: { vl_total: itens.reduce((sum, row) => sum.add(row.vl_total as Prisma.Decimal), new Prisma.Decimal(0)) } }),
    },
  }
  const db = {
    $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) => {
      const anterior = { saldo, itens: itens.map(row => ({ ...row })) }
      try { return await callback(transaction) }
      catch (error) { saldo = anterior.saldo; itens = anterior.itens; throw error }
    },
  } as unknown as PrismaClient
  return { repository: new OrderRepository(db), saldo: () => saldo.toNumber(), itens: () => itens }
}

test('itens: inclusão, alteração e exclusão mantêm estoque e total consistentes', async () => {
  const db = database()
  const row = await db.repository.saveItem(1n, null, item)
  assert.equal(db.saldo(), 3)
  assert.equal(Number(row.vl_total), 39.9)
  await db.repository.saveItem(1n, row.cn_item, { ...item, qt_quantidade: 3 })
  assert.equal(db.saldo(), 2)
  await db.repository.removeItem(1n, row.cn_item)
  assert.equal(db.saldo(), 5)
  assert.equal(db.itens().length, 0)
})

test('itens: estoque insuficiente desfaz inclusão e alteração, inclusive o estorno', async () => {
  const db = database()
  await assert.rejects(() => db.repository.saveItem(1n, null, { ...item, qt_quantidade: 6 }), /Estoque insuficiente/)
  assert.equal(db.saldo(), 5)
  assert.equal(db.itens().length, 0)
  const row = await db.repository.saveItem(1n, null, item)
  await assert.rejects(() => db.repository.saveItem(1n, row.cn_item, { ...item, qt_quantidade: 6 }), /Estoque insuficiente/)
  assert.equal(db.saldo(), 3)
  assert.equal(db.itens()[0]?.qt_quantidade, 2)
})

test('itens: troca de produto por serviço estorna e não debita estoque', async () => {
  const db = database()
  const row = await db.repository.saveItem(1n, null, item)
  await db.repository.saveItem(1n, row.cn_item, { ...item, ca_tipo: 'SERVICO', cn_produto: null, cn_servico: 1 })
  assert.equal(db.saldo(), 5)
  await assert.rejects(() => db.repository.removeItem(2n, row.cn_item), /Item não encontrado/)
  assert.equal(db.itens().length, 1)
})

test('controller de usuários aguarda gravação e propaga erro em vez de responder antes', async () => {
  const service = { create: async () => { await new Promise(resolve => setTimeout(resolve, 5)); throw new Error('falha ao gravar') } } as unknown as UserService
  const controller = new UserController(service)
  const request = { body: { an_nome: 'Teste', an_email: 'teste@example.com', ca_senha: '123456', bo_sts_reg: true }, log: {} } as FastifyRequest
  await assert.rejects(() => controller.create(request), /falha ao gravar/)
})

test('rotas: autenticam, validam, serializam pessoas/endereço e retornam erros de banco', async () => {
  const app = Fastify()
  app.setErrorHandler(ApiResponse.error)
  let nextId = 1n
  const repo = {
    create: async (values: ReturnType<typeof PersonValidator.parse>) => {
      if (nextId > 1n) throw { code: 'P2002' }
      const id = nextId++
      return { ...values, cn_pessoa: id, dt_inc: new Date(), dt_alt: new Date(),
        endereco: { ...values.endereco, cn_endereco: id, cn_pessoa: id } }
    },
    list: async () => ({ pessoas: [], total: 0 }),
  } as unknown as IPersonRepository
  const auth = { authenticate: async (authorization: string) => {
    if (authorization !== 'Bearer teste') throw Object.assign(new Error('Token inválido'), { statusCode: 401 })
    return { uid: 'teste' }
  } } as unknown as AuthService
  new PersonRoutes(new PersonController(new PersonService(repo))).register(new ApiRouter(app, new AuthMiddleware(auth)))
  const request = (payload: unknown, authenticated = true) => app.inject({ method: 'POST', url: '/pessoa',
    headers: authenticated ? { authorization: 'Bearer teste' } : {}, payload })
  try {
    assert.equal((await request(pessoa, false)).statusCode, 401)
    assert.equal((await request({ ...pessoa, ca_cpf: '' })).statusCode, 400)
    const created = await request(pessoa)
    assert.equal(created.statusCode, 201)
    assert.equal(created.json().dados.cn_pessoa, '1')
    assert.equal(created.json().dados.endereco.cn_endereco, '1')
    assert.equal((await request(pessoa)).statusCode, 409)
  } finally { await app.close() }
})

test('rotas: catálogo e ordens validam payload e preservam respostas persistidas', async () => {
  const app = Fastify()
  app.setErrorHandler(ApiResponse.error)
  const auth = { authenticate: async () => ({ uid: 'teste' }) } as unknown as AuthService
  const router = new ApiRouter(app, new AuthMiddleware(auth))
  const catalog = { createProduct: async (values: typeof produto) => ({ ...values, cn_produto: 7 }) } as unknown as ICatalogRepository
  const orders = { saveOrder: async (_id: bigint | null, values: ReturnType<typeof OrderValidator.order>) => ({
    ...values, cn_ordem_servico: 9n, nu_numero: 9, pessoa: { an_nome: 'Cliente' }, itens: [],
  }) } as unknown as IOrderRepository
  new CatalogRoutes(new CatalogController(new CatalogService(catalog))).register(router)
  new OrderRoutes(new OrderController(new OrderService(orders))).register(router)
  try {
    const created = await app.inject({ method: 'POST', url: '/produtos', payload: produto })
    assert.equal(created.statusCode, 201)
    assert.equal(created.json().dados.cn_produto, 7)
    const invalid = await app.inject({ method: 'POST', url: '/ordensServico', payload: { ...ordem, cn_pessoa: 'abc' } })
    assert.equal(invalid.statusCode, 400)
    const saved = await app.inject({ method: 'POST', url: '/ordensServico', payload: ordem })
    assert.equal(saved.statusCode, 201)
    assert.equal(saved.json().dados.cn_ordem_servico, '9')
    assert.equal(saved.json().dados.veiculo.an_placa, 'ABC1234')
    assert.equal(saved.json().dados.an_cliente, 'Cliente')
  } finally { await app.close() }
})
