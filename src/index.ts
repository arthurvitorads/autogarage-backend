import { FaturamentoRepository } from './repositories/faturamento.repository.js'
import { FaturamentoService } from './services/faturamento.service.js'
import 'dotenv/config'

import { Application } from './app.js'

import { prisma } from './prisma.js'

import { firebaseAuth } from './firebase-admin.js'
import { UserRepository } from './repositories/user.repository.js'
import { PerfilRepository } from './repositories/perfil.repository.js'
import { OrderRepository } from './repositories/order.repository.js'
import { PersonRepository } from './repositories/person.repository.js'
import { AddressRepository } from './repositories/address.repository.js'

import { FirebaseService } from './services/firebase.service.js'

import { AuthService } from './services/auth.service.js'
import { UserService } from './services/user.service.js'
import { PerfilService } from './services/perfil.service.js'
import { OrderService } from './services/order.service.js'
import { PersonService } from './services/person.service.js'
import { AddressService } from './services/address.service.js'
import { CatalogRepository } from './repositories/catalog.repository.js'
import { CatalogService } from './services/catalog.service.js'
import { ProductCategoryRepository } from './repositories/product-category.repository.js'
import { ProductCategoryService } from './services/product-category.service.js'
import { ProductCategoryController } from './controllers/product-category.controller.js'
import { ProductCategoryRoutes } from './routes/product-category.route.js'
import { ServiceCategoryRepository } from './repositories/service-category.repository.js'
import { ServiceCategoryService } from './services/service-category.service.js'
import { ServiceCategoryController } from './controllers/service-category.controller.js'
import { ServiceCategoryRoutes } from './routes/service-category.route.js'
import { BrandRepository } from './repositories/brand.repository.js'
import { BrandService } from './services/brand.service.js'
import { BrandController } from './controllers/brand.controller.js'
import { BrandRoutes } from './routes/brand.route.js'
import { UnitRepository } from './repositories/unit.repository.js'
import { UnitService } from './services/unit.service.js'
import { UnitController } from './controllers/unit.controller.js'
import { UnitRoutes } from './routes/unit.route.js'
import { ProductRepository } from './repositories/product.repository.js'
import { ProductService } from './services/product.service.js'
import { ProductController } from './controllers/product.controller.js'
import { ProductRoutes } from './routes/product.route.js'
import { ServiceRepository } from './repositories/service.repository.js'
import { ServiceService } from './services/service.service.js'
import { ServiceController } from './controllers/service.controller.js'
import { ServiceRoutes } from './routes/service.route.js'

const usrRepository = new UserRepository(prisma)
const pflRepository = new PerfilRepository(prisma)
const ordRepository = new OrderRepository(prisma)
const prsRespository = new PersonRepository(prisma)

const firebase = new FirebaseService(firebaseAuth)

const application = new Application(
  new AuthService(usrRepository, firebase),
  new UserService(usrRepository, firebase),
  new PerfilService(pflRepository),
  new OrderService(ordRepository),
  new PersonService(prsRespository),
  new CatalogService(new CatalogRepository(prisma)),
  new FaturamentoService(new FaturamentoRepository(prisma)),
  new AddressService(new AddressRepository(prisma)),
  true,
  [
    new ProductCategoryRoutes(
      new ProductCategoryController(
        new ProductCategoryService(new ProductCategoryRepository(prisma)),
      ),
    ),
    new ServiceCategoryRoutes(
      new ServiceCategoryController(
        new ServiceCategoryService(new ServiceCategoryRepository(prisma)),
      ),
    ),
    new BrandRoutes(new BrandController(new BrandService(new BrandRepository(prisma)))),
    new UnitRoutes(new UnitController(new UnitService(new UnitRepository(prisma)))),
    new ProductRoutes(new ProductController(new ProductService(new ProductRepository(prisma)))),
    new ServiceRoutes(new ServiceController(new ServiceService(new ServiceRepository(prisma)))),
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
