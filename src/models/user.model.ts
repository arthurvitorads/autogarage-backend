import type { AdmUsuario, AdmPerfil } from '@prisma/client';

export class UserModel {
  static toResponse(user: AdmUsuario & { perfil?: Pick<AdmPerfil, 'an_descr'> | null }) {
    const { perfil, ...data } = user;
    return { 
      ...data,
      cn_usuario: user.cn_usuario.toString(),
      cn_perfil: user.cn_perfil?.toString(),
      an_perfil: perfil?.an_descr ?? null,
    };
  }

  static toSession(user: AdmUsuario & { perfil: Pick<AdmPerfil, 'an_descr'> | null }) {
    return {
      cn_usuario: user.cn_usuario.toString(),
      ca_id_firebase: user.ca_id_firebase,
      an_email: user.an_email,
      an_nome: user.an_nome,
      an_perfil: user.perfil?.an_descr,
      bo_sts_reg: user.bo_sts_reg,
    };
  }
}
