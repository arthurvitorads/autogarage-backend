import type { CadServico } from '@prisma/client'

export class ServicoModel {
  static paraResposta(servico: CadServico) {
    const { nu_tempo_estimado: _tempoEstimado, ...dados } = servico

    return {
      ...dados,
      vl_preco: Number(servico.vl_preco),
    }
  }
}
