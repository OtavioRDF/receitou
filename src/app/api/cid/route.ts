import { NextRequest, NextResponse } from "next/server"
import cidData from "@/data/cid-10-full.json"

interface CIDEntry {
  codigo: string
  descricao: string
}

const cids: CIDEntry[] = cidData as CIDEntry[]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const termo = searchParams.get("q")?.toLowerCase().trim()

  if (!termo || termo.length < 2) {
    return NextResponse.json([])
  }

  const resultados = cids
    .filter(
      (cid) =>
        cid.codigo.toLowerCase().includes(termo) ||
        cid.descricao.toLowerCase().includes(termo)
    )
    .slice(0, 15)

  return NextResponse.json(resultados)
}
