import type { IManutPerson } from '../interfaces/person.js'
import { ApiError } from '../interfaces/error.js'
import { DataValidator as Data } from './data.validator.js'

export class PersonValidator {
  static parse(body: unknown): IManutPerson {
    const data = Data.object(body)
    if (data.ca_tipo !== 'PF' && data.ca_tipo !== 'PJ')
      throw new ApiError(400, 'Tipo de pessoa inválido.')
    const cliente = Data.boolean(data.bo_categ_cliente)
    const funcionario = Data.boolean(data.bo_categ_func)
    if (!cliente && !funcionario)
      throw new ApiError(400, 'Selecione pelo menos uma categoria.')
    const documento = Data.text(data.ca_tipo === 'PF' ? data.ca_cpf : data.ca_cnpj, 'o documento').replace(/[.\/-]/g, '').toUpperCase()
    if (!this.document(documento, data.ca_tipo))
      throw new ApiError(400, 'Documento inválido.')
    const email = Data.text(data.an_email, 'o e-mail').toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new ApiError(400, 'E-mail inválido.')
    const telefone = Data.text(data.an_telefone, 'o telefone').replace(/\D/g, '')
    if (!/^\d{10,11}$/.test(telefone))
      throw new ApiError(400, 'Telefone inválido.')
    const endereco = Data.object(data.endereco)
    const cep = Data.text(endereco.ca_cep, 'o CEP').replace(/\D/g, '')
    const uf = Data.text(endereco.ca_uf, 'a UF').toUpperCase()
    if (!/^\d{8}$/.test(cep))
      throw new ApiError(400, 'CEP inválido.')
    if (!'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ').includes(uf))
      throw new ApiError(400, 'UF inválida.')
    return {
      ca_tipo: data.ca_tipo,
      an_nome: data.ca_tipo === 'PF' ? Data.text(data.an_nome, 'o nome') : null,
      ca_cpf: data.ca_tipo === 'PF' ? documento : null,
      ca_cnpj: data.ca_tipo === 'PJ' ? documento : null,
      an_razao_social: data.ca_tipo === 'PJ' ? Data.text(data.an_razao_social, 'a razão social') : null,
      an_nome_fantasia: data.ca_tipo === 'PJ' ? Data.text(data.an_nome_fantasia, 'o nome fantasia') : null,
      an_email: email,
      an_telefone: telefone,
      bo_categ_cliente: cliente,
      bo_categ_func: funcionario,
      an_cargo: funcionario ? Data.text(data.an_cargo, 'o cargo', false) : '',
      nm_comissao_percentual: funcionario ? Data.decimal(data.nm_comissao_percentual, 'a comissão', 2, 100) : 0,
      bo_sts_reg: Data.boolean(data.bo_sts_reg),
      endereco: {
        ca_cep: cep,
        ca_uf: uf,
        an_logradouro: Data.text(endereco.an_logradouro, 'o logradouro'),
        an_numero: Data.text(endereco.an_numero, 'o número'),
        an_complemento: Data.text(endereco.an_complemento, 'o complemento', false),
        an_bairro: Data.text(endereco.an_bairro, 'o bairro'),
        an_cidade: Data.text(endereco.an_cidade, 'a cidade'),
      },
    }
  }

  static document(value: string, tipo: 'PF' | 'PJ'): boolean {
    if (tipo === 'PF') {
      if (!/^\d{11}$/.test(value) || /^(\d)\1+$/.test(value))
        return false
      for (let length = 9; length <= 10; length++) {
        const sum = [...value.slice(0, length)].reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0)
        const digit = (sum * 10 % 11) % 10
        if (digit !== Number(value[length]))
          return false
      }
      return true
    }
    if (!/^[A-Z0-9]{12}\d{2}$/.test(value) || /^(\d)\1+$/.test(value))
      return false
    for (let length = 12; length <= 13; length++) {
      const weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      const sum = [...value.slice(0, length)].reduce((total, digit, index) => total + (digit.charCodeAt(0) - 48) * weights[index]!, 0)
      const remainder = sum % 11
      if ((remainder < 2 ? 0 : 11 - remainder) !== Number(value[length]))
        return false
    }
    return true
  }
}
