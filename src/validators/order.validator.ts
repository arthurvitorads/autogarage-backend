import type { IManutOrder, IManutStatusOrder, IManutItemOrder } from '../interfaces/order.js'
import { ApiError } from '../interfaces/error.js'
import { DataValidator as Data } from './data.validator.js'

export class OrderValidator {
  static status(body: unknown): IManutStatusOrder {
    const data = Data.object(body)
    const cor = Data.text(data.ca_cor, 'a cor')
    if (!/^#[A-Fa-f0-9]{6}$/.test(cor))
      throw new ApiError(400, 'Cor inválida.')
    return {
      an_descr: Data.text(data.an_descr, 'a descrição'),
      ca_cor: cor,
      bo_padrao: Data.boolean(data.bo_padrao)
    }
  }

  static order(body: unknown): IManutOrder {
    const data = Data.object(body)
    const veiculo = Data.object(data.veiculo)
    const entrada = new Date(Data.text(data.dt_entrada, 'a data de entrada'))
    const previsao = data.dt_previsao ? new Date(Data.text(data.dt_previsao, 'a previsão')) : null
    if (!Number.isFinite(entrada.getTime()) || (previsao && (!Number.isFinite(previsao.getTime()) || previsao < entrada)))
      throw new ApiError(400, 'Datas da ordem inválidas.')
    const placa = Data.text(veiculo.an_placa, 'a placa').toUpperCase().replace(/[\s-]/g, '')
    if (!/^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(placa))
      throw new ApiError(400, 'Placa inválida.')
    return {
      cn_pessoa: Data.id(data.cn_pessoa),
      cn_status_os: Data.id(data.cn_status),
      dt_entrada: entrada,
      dt_previsao: previsao,
      an_responsavel: Data.text(data.an_responsavel, 'o responsável', false),
      an_placa: placa,
      an_marca: Data.text(veiculo.an_marca, 'a marca'),
      an_modelo: Data.text(veiculo.an_modelo, 'o modelo'),
      nu_ano: Data.integer(veiculo.nu_ano, 'o ano', 1900, new Date().getFullYear() + 1),
      an_cor: Data.text(veiculo.an_cor, 'a cor', false),
      qt_quilometragem: Data.integer(veiculo.qt_quilometragem, 'a quilometragem', 0, 9999999),
      an_solicitacao: Data.text(data.an_solicitacao, 'a solicitação', false),
      an_obs: Data.text(data.an_obs, 'a observação', false),
    }
  }

  static item(body: unknown): IManutItemOrder {
    const data = Data.object(body)
    if (data.ca_tipo !== 'PRODUTO' && data.ca_tipo !== 'SERVICO')
      throw new ApiError(400, 'Tipo de item inválido.')
    const quantidade = Data.decimal(data.qt_quantidade, 'a quantidade', 3, 999999999.999)
    if (!quantidade)
      throw new ApiError(400, 'A quantidade deve ser maior que zero.')
    return {
      ca_tipo: data.ca_tipo,
      cn_produto: data.ca_tipo === 'PRODUTO' ? Data.code(data.cn_produto) : null,
      cn_servico: data.ca_tipo === 'SERVICO' ? Data.code(data.cn_servico) : null,
      qt_quantidade: quantidade,
      vl_unitario: Data.decimal(data.vl_unitario, 'o preço'),
    }
  }
}
