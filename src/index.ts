import 'dotenv/config'

import { Application } from './app.js'

import { prisma } from './prisma.js'

import { firebaseAuth } from './firebase-admin.js'

import { UserRepository } from './repositories/user.repository.js'
import { PerfilRepository } from './repositories/perfil.repository.js'
import { OrderRepository } from './repositories/order.repository.js'
import { PersonRepository } from './repositories/person.repository.js'

import { FirebaseService } from './services/firebase.service.js'

import { AuthService } from './services/auth.service.js'
import { UserService } from './services/user.service.js'
import { PerfilService } from './services/perfil.service.js'
import { OrderService } from './services/order.service.js'
import { PersonService } from './services/person.service.js'

const usrRepository  = new UserRepository(prisma)
const pflRepository  = new PerfilRepository(prisma)
const ordRepository  = new OrderRepository(prisma)
const prsRespository = new PersonRepository(prisma)

const firebase = new FirebaseService(firebaseAuth)

const application = new Application(
  new AuthService   (usrRepository, firebase),
  new UserService   (usrRepository, firebase),
  new PerfilService (pflRepository),
  new OrderService  (ordRepository),
  new PersonService (prsRespository)
)

const app = application.server

app.addHook('onClose', async () => {
  await prisma.$disconnect()
})

app.listen(
  {
    port: Number(process.env.PORT),
    host: process.env.HOST ?? '0.0.0.0'
  }
).catch((error) => {
  app.log.error(error)
  process.exitCode = 1
})
