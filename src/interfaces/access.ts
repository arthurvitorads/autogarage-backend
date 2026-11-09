export const modules = [
  'GERAL',
  'CADASTROS',
  'ORDEM_SERVICO',
  'FATURAMENTO',
  'RELATORIOS',
  'ADMINISTRACAO',
] as const

export type TModule = (typeof modules)[number]
export type TAccessLevel = 1 | 2 | 3
export type TModuleAccess = Partial<Record<TModule, TAccessLevel>>
export type TAccessRule = readonly [module: TModule, maximumLevel: 1 | 2]

export function moduleAccess(
  rows: readonly { ca_modulo: string; nu_nivel: number }[],
): TModuleAccess {
  const access: TModuleAccess = {}
  for (const module of modules) {
    const level = rows.find((row) => row.ca_modulo === module)?.nu_nivel
    access[module] = level === 1 || level === 2 ? level : 3
  }
  return access
}
