import 'dotenv/config'

import { Application } from './app.js'

import { prisma } from './prisma.js'

import { firebaseAuth } from './firebase-admin.js'

import { UserRepository } from './repositories/user.repository.js'
import { FirebaseService } from './services/firebase.service.js'

import { AuthService } from './services/auth.service.js'
import { UserService } from './services/user.service.js'

const repository = new UserRepository(prisma)

const firebase = new FirebaseService(firebaseAuth)

const application = new Application(
  new AuthService(repository, firebase),
  new UserService(repository, firebase)
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
