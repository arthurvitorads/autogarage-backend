import type { AdmPerfil } from '@prisma/client';

export class PerfilModel {
  static toResponse(perfil: AdmPerfil) {
    return { 
      ...perfil, 
      cn_perfil: 
      perfil.cn_perfil.toString() 
    };
  }
}
