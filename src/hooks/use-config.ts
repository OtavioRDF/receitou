"use client"

import { useLocalStorage } from "./use-local-storage"
import type { DoctorConfig } from "@/types"

const STORAGE_KEY = "receitou:config-medico"

const defaultConfig: DoctorConfig = {
  name: "",
  crm: "",
  specialty: "",
  phone: "",
  email: "",
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function migrate(raw: unknown): DoctorConfig {
  const c = raw as any
  return {
    name: c.name ?? c.nome ?? "",
    crm: c.crm ?? "",
    specialty: c.specialty ?? c.especialidade ?? "",
    phone: c.phone ?? c.telefone ?? "",
    email: c.email ?? "",
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function useConfig() {
  const [config, setConfig, isLoaded] = useLocalStorage<DoctorConfig>(
    STORAGE_KEY,
    defaultConfig,
    migrate
  )

  return { config, setConfig, isLoaded }
}
