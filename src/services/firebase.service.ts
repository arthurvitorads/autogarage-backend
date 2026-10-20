import type { Auth, CreateRequest, UpdateRequest } from 'firebase-admin/auth'

export class FirebaseService {
  constructor(private readonly auth: Auth) {}

  verifyToken(token: string) { 
    return this.auth.verifyIdToken(token, true) 
  }

  getUser(uid: string) { 
    return this.auth.getUser(uid) 
  }

  createUser(values: CreateRequest) { 
    return this.auth.createUser(values) 
  }
  
  updateUser(uid: string, values: UpdateRequest) { 
    return this.auth.updateUser(uid, values) 
  }

  deleteUser(uid: string) { 
    return this.auth.deleteUser(uid) 
  }
}

export type IFirebaseService = Pick<FirebaseService,
  'verifyToken' | 'getUser' | 'createUser' | 'updateUser' | 'deleteUser'>
