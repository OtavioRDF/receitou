"use client"

import { useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"
import type { Prescricao, Medicamento, Paciente } from "@/types"

const STORAGE_KEY = "receitou:prescricoes"

export function usePrescricoes() {
  const [prescricoes, setPrescricoes, isLoaded] = useLocalStorage<Prescricao[]>(
    STORAGE_KEY,
    []
  )

  const criar = useCallback(
    (data: { paciente: Paciente; medicamentos: Medicamento[]; observacoes?: string; templateId?: string }) => {
      const now = new Date().toISOString()
      const nova: Prescricao = {
        id: crypto.randomUUID(),
        ...data,
        criadoEm: now,
        atualizadoEm: now,
      }
      setPrescricoes((prev) => [nova, ...prev])
      return nova
    },
    [setPrescricoes]
  )

  const atualizar = useCallback(
    (id: string, data: Partial<Omit<Prescricao, "id" | "criadoEm">>) => {
      setPrescricoes((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...data, atualizadoEm: new Date().toISOString() }
            : p
        )
      )
    },
    [setPrescricoes]
  )

  const excluir = useCallback(
    (id: string) => {
      setPrescricoes((prev) => prev.filter((p) => p.id !== id))
    },
    [setPrescricoes]
  )

  const buscarPorId = useCallback(
    (id: string) => prescricoes.find((p) => p.id === id),
    [prescricoes]
  )

  return {
    prescricoes,
    isLoaded,
    criar,
    atualizar,
    excluir,
    buscarPorId,
  }
}
