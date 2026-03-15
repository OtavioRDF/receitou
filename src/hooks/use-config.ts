"use client"

import { useLocalStorage } from "./use-local-storage"
import type { ConfigMedico } from "@/types"

const STORAGE_KEY = "receitou:config-medico"

const defaultConfig: ConfigMedico = {
  nome: "",
  crm: "",
  especialidade: "",
  telefone: "",
  email: "",
}

export function useConfig() {
  const [config, setConfig, isLoaded] = useLocalStorage<ConfigMedico>(
    STORAGE_KEY,
    defaultConfig
  )

  return { config, setConfig, isLoaded }
}
