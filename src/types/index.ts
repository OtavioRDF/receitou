export interface Medication {
  id: string
  name: string
  dosage: string
  route: string
  frequency: string
  duration?: string
  notes?: string
}

export type WeightUnit = "kg" | "lb"
export type HeightUnit = "cm" | "m"

export interface Patient {
  name: string
  age?: number
  weight?: number
  weightUnit?: WeightUnit
  height?: number
  heightUnit?: HeightUnit
}

export interface Prescription {
  id: string
  patient: Patient
  medications: Medication[]
  notes?: string
  templateId?: string
  createdAt: string
  updatedAt: string
}

export interface Template {
  id: string
  name: string
  description?: string
  medications: Medication[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DoctorConfig {
  name: string
  crm: string
  specialty?: string
  phone?: string
  email?: string
}

export interface Institution {
  id: string
  name: string
  address?: string
  phone?: string
  logo?: string // base64 data URL
}

export interface CID {
  code: string
  description: string
}

export interface MedicationAPI {
  name: string
  presentation?: string
  laboratory?: string
}
