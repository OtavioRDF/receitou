import type { CID } from "@/types"

export async function searchCID(term: string): Promise<CID[]> {
  if (term.trim().length < 2) return []

  try {
    const res = await fetch(`/api/cid?q=${encodeURIComponent(term)}`)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}
