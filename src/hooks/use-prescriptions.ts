"use client"

import { useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"
import type { Prescription, Medication, Patient } from "@/types"

const STORAGE_KEY = "receitou:prescricoes"

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

function migratePatient(p: any): Patient {
  return {
    name: p.name ?? p.nome ?? "",
    age: p.age ?? p.idade,
    weight: p.weight ?? p.peso,
    weightUnit: p.weightUnit ?? p.pesoUnidade,
    height: p.height ?? p.altura,
    heightUnit: p.heightUnit ?? p.alturaUnidade,
  }
}

function migrate(raw: unknown): Prescription[] {
  if (!Array.isArray(raw)) return []
  return raw.map((p: any) => ({
    id: p.id,
    patient: migratePatient(p.patient ?? p.paciente ?? {}),
    medications: (p.medications ?? p.medicamentos ?? []).map(migrateMed),
    notes: p.notes ?? p.observacoes,
    templateId: p.templateId,
    createdAt: p.createdAt ?? p.criadoEm ?? new Date().toISOString(),
    updatedAt: p.updatedAt ?? p.atualizadoEm ?? new Date().toISOString(),
  }))
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function usePrescriptions() {
  const [prescriptions, setPrescriptions, isLoaded] = useLocalStorage<Prescription[]>(
    STORAGE_KEY,
    [],
    migrate
  )

  const create = useCallback(
    (data: { patient: Patient; medications: Medication[]; notes?: string; templateId?: string }) => {
      const now = new Date().toISOString()
      const item: Prescription = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: now,
        updatedAt: now,
      }
      setPrescriptions((prev) => [item, ...prev])
      return item
    },
    [setPrescriptions]
  )

  const update = useCallback(
    (id: string, data: Partial<Omit<Prescription, "id" | "createdAt">>) => {
      setPrescriptions((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...data, updatedAt: new Date().toISOString() }
            : p
        )
      )
    },
    [setPrescriptions]
  )

  const remove = useCallback(
    (id: string) => {
      setPrescriptions((prev) => prev.filter((p) => p.id !== id))
    },
    [setPrescriptions]
  )

  const duplicate = useCallback(
    (id: string) => {
      const original = prescriptions.find((p) => p.id === id)
      if (!original) return null
      const now = new Date().toISOString()
      const copy: Prescription = {
        ...original,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      }
      setPrescriptions((prev) => [copy, ...prev])
      return copy
    },
    [prescriptions, setPrescriptions]
  )

  const findById = useCallback(
    (id: string) => prescriptions.find((p) => p.id === id),
    [prescriptions]
  )

  return {
    prescriptions,
    isLoaded,
    create,
    update,
    remove,
    duplicate,
    findById,
  }
}
