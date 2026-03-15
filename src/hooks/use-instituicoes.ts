"use client"

import { useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"
import type { Instituicao } from "@/types"

const STORAGE_KEY = "receitou:instituicoes"

export function useInstituicoes() {
  const [instituicoes, setInstituicoes, isLoaded] = useLocalStorage<
    Instituicao[]
  >(STORAGE_KEY, [])

  const criar = useCallback(
    (data: Omit<Instituicao, "id">) => {
      const nova: Instituicao = {
        id: crypto.randomUUID(),
        ...data,
      }
      setInstituicoes((prev) => [...prev, nova])
      return nova
    },
    [setInstituicoes]
  )

  const atualizar = useCallback(
    (id: string, data: Partial<Omit<Instituicao, "id">>) => {
      setInstituicoes((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...data } : i))
      )
    },
    [setInstituicoes]
  )

  const excluir = useCallback(
    (id: string) => {
      setInstituicoes((prev) => prev.filter((i) => i.id !== id))
    },
    [setInstituicoes]
  )

  const buscarPorId = useCallback(
    (id: string) => instituicoes.find((i) => i.id === id),
    [instituicoes]
  )

  return {
    instituicoes,
    isLoaded,
    criar,
    atualizar,
    excluir,
    buscarPorId,
  }
}
