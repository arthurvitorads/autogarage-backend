import type { AdmPerfil } from '@prisma/client'

export class PerfilModel {
  static paraResposta(perfil: AdmPerfil) {
    return {
      ...perfil,
      cn_perfil: perfil.cn_perfil.toString(),
    }
  }

  static paraParam(perfil: { cn_perfil: bigint; an_descr: string }) {
    return {
      id: perfil.cn_perfil.toString(),
      an_descr: perfil.an_descr,
    }
  }
}
