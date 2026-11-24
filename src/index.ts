import { FaturamentoRepository } from './repositories/faturamento.repository.js'
import { FaturamentoService } from './services/faturamento.service.js'
import 'dotenv/config'

import { Application } from './app.js'

import { prisma } from './prisma.js'

import { firebaseAuth } from './firebase-admin.js'
import { UsuarioRepository } from './repositories/usuario.repository.js'
import { PerfilRepository } from './repositories/perfil.repository.js'
import { OrdemServicoRepository } from './repositories/ordem-servico.repository.js'
import { PessoaRepository } from './repositories/pessoa.repository.js'
import { EnderecoRepository } from './repositories/endereco.repository.js'

import { FirebaseService } from './services/firebase.service.js'

import { AuthService } from './services/auth.service.js'
import { UsuarioService } from './services/usuario.service.js'
import { PerfilService } from './services/perfil.service.js'
import { OrdemServicoService } from './services/ordem-servico.service.js'
import { PessoaService } from './services/pessoa.service.js'
import { EnderecoService } from './services/endereco.service.js'
import { CatalogoRepository } from './repositories/catalogo.repository.js'
import { CatalogoService } from './services/catalogo.service.js'
import { CategoriaProdutoRepository } from './repositories/categoria-produto.repository.js'
import { CategoriaProdutoService } from './services/categoria-produto.service.js'
import { CategoriaProdutoController } from './controllers/categoria-produto.controller.js'
import { CategoriaProdutoRoutes } from './routes/categoria-produto.route.js'
import { CategoriaServicoRepository } from './repositories/categoria-servico.repository.js'
import { CategoriaServicoService } from './services/categoria-servico.service.js'
import { CategoriaServicoController } from './controllers/categoria-servico.controller.js'
import { CategoriaServicoRoutes } from './routes/categoria-servico.route.js'
import { MarcaRepository } from './repositories/marca.repository.js'
import { MarcaService } from './services/marca.service.js'
import { MarcaController } from './controllers/marca.controller.js'
import { MarcaRoutes } from './routes/marca.route.js'
import { UnidadeRepository } from './repositories/unidade.repository.js'
import { UnidadeService } from './services/unidade.service.js'
import { UnidadeController } from './controllers/unidade.controller.js'
import { UnidadeRoutes } from './routes/unidade.route.js'
import { ProdutoRepository } from './repositories/produto.repository.js'
import { ProdutoService } from './services/produto.service.js'
import { ProdutoController } from './controllers/produto.controller.js'
import { ProdutoRoutes } from './routes/produto.route.js'
import { ServicoRepository } from './repositories/servico.repository.js'
import { ServicoService } from './services/servico.service.js'
import { ServicoController } from './controllers/servico.controller.js'
import { ServicoRoutes } from './routes/servico.route.js'

const usuarioRepository = new UsuarioRepository(prisma)
const perfilRepository = new PerfilRepository(prisma)
const ordemServicoRepository = new OrdemServicoRepository(prisma)
const pessoaRepository = new PessoaRepository(prisma)

const firebase = new FirebaseService(firebaseAuth)

const application = new Application(
  new AuthService(usuarioRepository, firebase),
  new UsuarioService(usuarioRepository, firebase),
  new PerfilService(perfilRepository),
  new OrdemServicoService(ordemServicoRepository),
  new PessoaService(pessoaRepository),
  new CatalogoService(new CatalogoRepository(prisma)),
  new FaturamentoService(new FaturamentoRepository(prisma)),
  new EnderecoService(new EnderecoRepository(prisma)),
  true,
  [
    new CategoriaProdutoRoutes(
      new CategoriaProdutoController(
        new CategoriaProdutoService(new CategoriaProdutoRepository(prisma)),
      ),
    ),
    new CategoriaServicoRoutes(
      new CategoriaServicoController(
        new CategoriaServicoService(new CategoriaServicoRepository(prisma)),
      ),
    ),
    new MarcaRoutes(new MarcaController(new MarcaService(new MarcaRepository(prisma)))),
    new UnidadeRoutes(new UnidadeController(new UnidadeService(new UnidadeRepository(prisma)))),
    new ProdutoRoutes(new ProdutoController(new ProdutoService(new ProdutoRepository(prisma)))),
    new ServicoRoutes(new ServicoController(new ServicoService(new ServicoRepository(prisma)))),
  ],
)

const app = application.server

app.addHook('onClose', async () => {
  await prisma.$disconnect()
})

app
  .listen({
    port: Number(process.env.PORT),
    host: process.env.HOST ?? '0.0.0.0',
  })
  .catch((error) => {
    app.log.error(error)
    process.exitCode = 1
  })
