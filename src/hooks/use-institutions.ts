"use client"

import { useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"
import type { Institution } from "@/types"

const STORAGE_KEY = "receitou:instituicoes"

/* eslint-disable @typescript-eslint/no-explicit-any */
function migrate(raw: unknown): Institution[] {
  if (!Array.isArray(raw)) return []
  return raw.map((i: any) => ({
    id: i.id,
    name: i.name ?? i.nome ?? "",
    address: i.address ?? i.endereco,
    phone: i.phone ?? i.telefone,
    logo: i.logo,
  }))
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function useInstitutions() {
  const [institutions, setInstitutions, isLoaded] = useLocalStorage<
    Institution[]
  >(STORAGE_KEY, [], migrate)

  const create = useCallback(
    (data: Omit<Institution, "id">) => {
      const item: Institution = {
        id: crypto.randomUUID(),
        ...data,
      }
      setInstitutions((prev) => [...prev, item])
      return item
    },
    [setInstitutions]
  )

  const update = useCallback(
    (id: string, data: Partial<Omit<Institution, "id">>) => {
      setInstitutions((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...data } : i))
      )
    },
    [setInstitutions]
  )

  const remove = useCallback(
    (id: string) => {
      setInstitutions((prev) => prev.filter((i) => i.id !== id))
    },
    [setInstitutions]
  )

  const findById = useCallback(
    (id: string) => institutions.find((i) => i.id === id),
    [institutions]
  )

  return {
    institutions,
    isLoaded,
    create,
    update,
    remove,
    findById,
  }
}
