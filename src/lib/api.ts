import type { MedicamentoAPI } from "@/types"

const ANVISA_BASE_URL = "https://bula.vercel.app/pesquisar"

export async function buscarMedicamentos(
  termo: string
): Promise<MedicamentoAPI[]> {
  if (termo.trim().length < 3) return []

  try {
    const res = await fetch(
      `${ANVISA_BASE_URL}?nome=${encodeURIComponent(termo)}`
    )

    if (!res.ok) return []

    const data = await res.json()

    return data.content?.map(
      (item: { nomeProduto: string; razaoSocial: string }) => ({
        nome: item.nomeProduto,
        laboratorio: item.razaoSocial,
      })
    ) ?? []
  } catch {
    return []
  }
}
