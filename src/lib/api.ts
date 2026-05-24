import type { MedicationAPI } from "@/types"

const ANVISA_BASE_URL = "https://bula.vercel.app/pesquisar"

export async function searchMedications(
  term: string
): Promise<MedicationAPI[]> {
  if (term.trim().length < 3) return []

  try {
    const res = await fetch(
      `${ANVISA_BASE_URL}?nome=${encodeURIComponent(term)}`
    )

    if (!res.ok) return []

    const data = await res.json()

    return data.content?.map(
      (item: { nomeProduto: string; razaoSocial: string }) => ({
        name: item.nomeProduto,
        laboratory: item.razaoSocial,
      })
    ) ?? []
  } catch {
    return []
  }
}
