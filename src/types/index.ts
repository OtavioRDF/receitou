export interface Medicamento {
  id: string
  nome: string
  dosagem: string
  via: string
  frequencia: string
  duracao?: string
  observacoes?: string
}

export type WeightUnit = "kg" | "lb"
export type HeightUnit = "cm" | "m"

export interface Paciente {
  nome: string
  idade?: number
  peso?: number
  pesoUnidade?: WeightUnit
  altura?: number
  alturaUnidade?: HeightUnit
}

export interface Prescricao {
  id: string
  paciente: Paciente
  medicamentos: Medicamento[]
  observacoes?: string
  templateId?: string
  criadoEm: string
  atualizadoEm: string
}

export interface Template {
  id: string
  nome: string
  descricao?: string
  medicamentos: Medicamento[]
  observacoes?: string
  criadoEm: string
  atualizadoEm: string
}

export interface ConfigMedico {
  nome: string
  crm: string
  especialidade?: string
  telefone?: string
  email?: string
}

export interface Instituicao {
  id: string
  nome: string
  endereco?: string
  telefone?: string
  logo?: string // base64 data URL
}

export interface CID {
  codigo: string
  descricao: string
}

export interface MedicamentoAPI {
  nome: string
  apresentacao?: string
  laboratorio?: string
}
