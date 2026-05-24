import { NextRequest, NextResponse } from "next/server"
import cidData from "@/data/cid-10-full.json"

interface CIDEntry {
  codigo: string
  descricao: string
}

const cids: CIDEntry[] = cidData as CIDEntry[]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const term = searchParams.get("q")?.toLowerCase().trim()

  if (!term || term.length < 2) {
    return NextResponse.json([])
  }

  const results = cids
    .filter(
      (cid) =>
        cid.codigo.toLowerCase().includes(term) ||
        cid.descricao.toLowerCase().includes(term)
    )
    .slice(0, 15)
    .map((cid) => ({ code: cid.codigo, description: cid.descricao }))

  return NextResponse.json(results)
}
