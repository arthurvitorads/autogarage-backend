import type { AdmUsuario } from '@prisma/client';

export class UserModel {
  static toResponse(user: AdmUsuario) {
    return { 
      ...user, 
      cn_usuario: user.cn_usuario.toString(),
      cn_perfil: user.cn_perfil?.toString(),
    };
  }

  static toSession(user: AdmUsuario) {
    return {
      cn_usuario: user.cn_usuario.toString(),
      ca_id_firebase: user.ca_id_firebase,
      an_email: user.an_email,
      an_nome: user.an_nome,
      bo_sts_reg: user.bo_sts_reg,
    };
  }
}
