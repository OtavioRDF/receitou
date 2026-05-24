"use client"

import { useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"
import type { Template, Medication } from "@/types"

const STORAGE_KEY = "receitou:templates"

/* eslint-disable @typescript-eslint/no-explicit-any */
function migrateMed(m: any): Medication {
  return {
    id: m.id,
    name: m.name ?? m.nome ?? "",
    dosage: m.dosage ?? m.dosagem ?? "",
    route: m.route ?? m.via ?? "",
    frequency: m.frequency ?? m.frequencia ?? "",
    duration: m.duration ?? m.duracao,
    notes: m.notes ?? m.observacoes,
  }
}

function migrate(raw: unknown): Template[] {
  if (!Array.isArray(raw)) return []
  return raw.map((t: any) => ({
    id: t.id,
    name: t.name ?? t.nome ?? "",
    description: t.description ?? t.descricao,
    medications: (t.medications ?? t.medicamentos ?? []).map(migrateMed),
    notes: t.notes ?? t.observacoes,
    createdAt: t.createdAt ?? t.criadoEm ?? new Date().toISOString(),
    updatedAt: t.updatedAt ?? t.atualizadoEm ?? new Date().toISOString(),
  }))
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function useTemplates() {
  const [templates, setTemplates, isLoaded] = useLocalStorage<Template[]>(
    STORAGE_KEY,
    [],
    migrate
  )

  const create = useCallback(
    (data: { name: string; description?: string; medications: Medication[]; notes?: string }) => {
      const now = new Date().toISOString()
      const item: Template = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: now,
        updatedAt: now,
      }
      setTemplates((prev) => [item, ...prev])
      return item
    },
    [setTemplates]
  )

  const update = useCallback(
    (id: string, data: Partial<Omit<Template, "id" | "createdAt">>) => {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...data, updatedAt: new Date().toISOString() }
            : t
        )
      )
    },
    [setTemplates]
  )

  const remove = useCallback(
    (id: string) => {
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    },
    [setTemplates]
  )

  const findById = useCallback(
    (id: string) => templates.find((t) => t.id === id),
    [templates]
  )

  return {
    templates,
    isLoaded,
    create,
    update,
    remove,
    findById,
  }
}
