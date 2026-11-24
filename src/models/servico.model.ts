import type { CadServico } from '@prisma/client'

export class ServicoModel {
  static paraResposta(servico: CadServico) {
    const { nu_tempo_estimado, ...dados } = servico

    return {
      ...dados,
      vl_preco: Number(servico.vl_preco),
      ...(nu_tempo_estimado === null ? {} : { nu_tempo_estimado }),
    }
  }
}
