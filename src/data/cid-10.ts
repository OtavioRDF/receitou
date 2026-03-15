import type { CID } from "@/types"

export async function buscarCID(termo: string): Promise<CID[]> {
  if (termo.trim().length < 2) return []

  try {
    const res = await fetch(`/api/cid?q=${encodeURIComponent(termo)}`)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}
