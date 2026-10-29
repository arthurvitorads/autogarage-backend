import { ApiError } from '../interfaces/error.js'

export class DataValidator {
  static object(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new ApiError(400, 'Dados inválidos.')
    return value as Record<string, unknown>
  }

  static id(value: unknown): bigint {
    if (typeof value === 'number' && !Number.isSafeInteger(value))
      throw new ApiError(400, 'Envie identificadores grandes como texto.')
    const id = String(value ?? '')
    if (!/^[1-9]\d*$/.test(id) || BigInt(id) > 9223372036854775807n)
      throw new ApiError(400, 'Identificador inválido.')
    return BigInt(id)
  }

  static code(value: unknown): number {
    const id = this.id(value)
    if (id > 2147483647n)
      throw new ApiError(400, 'Identificador inválido.')
    return Number(id)
  }

  static text(value: unknown, label: string, required = true): string {
    if (value == null && !required)
      return ''
    if (typeof value !== 'string' || value.length > 4000 || (required && !value.trim()))
      throw new ApiError(400, `Informe ${label}.`)
    return value.trim()
  }

  static boolean(value: unknown): boolean {
    if (typeof value !== 'boolean')
      throw new ApiError(400, 'Indicador inválido.')
    return value
  }

  static decimal(value: unknown, label: string, places = 2, max = 999999999.99): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max ||
      Math.abs(value * 10 ** places - Math.round(value * 10 ** places)) > 0.0001)
      throw new ApiError(400, `Informe ${label} válido, com até ${places} casas decimais.`)
    return value
  }

  static integer(value: unknown, label: string, min: number, max: number): number | null {
    if (value == null)
      return null
    if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max)
      throw new ApiError(400, `Informe ${label} válido.`)
    return value
  }
}
