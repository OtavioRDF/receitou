"use client"

import { useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"
import type { Template, Medicamento } from "@/types"

const STORAGE_KEY = "receitou:templates"

export function useTemplates() {
  const [templates, setTemplates, isLoaded] = useLocalStorage<Template[]>(
    STORAGE_KEY,
    []
  )

  const criar = useCallback(
    (data: { nome: string; descricao?: string; medicamentos: Medicamento[]; observacoes?: string }) => {
      const now = new Date().toISOString()
      const novo: Template = {
        id: crypto.randomUUID(),
        ...data,
        criadoEm: now,
        atualizadoEm: now,
      }
      setTemplates((prev) => [novo, ...prev])
      return novo
    },
    [setTemplates]
  )

  const atualizar = useCallback(
    (id: string, data: Partial<Omit<Template, "id" | "criadoEm">>) => {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...data, atualizadoEm: new Date().toISOString() }
            : t
        )
      )
    },
    [setTemplates]
  )

  const excluir = useCallback(
    (id: string) => {
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    },
    [setTemplates]
  )

  const buscarPorId = useCallback(
    (id: string) => templates.find((t) => t.id === id),
    [templates]
  )

  return {
    templates,
    isLoaded,
    criar,
    atualizar,
    excluir,
    buscarPorId,
  }
}
