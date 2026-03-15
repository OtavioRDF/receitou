"use client"

import { use, useRef, useState } from "react"
import { Box, Flex, Text } from "@chakra-ui/react"
import { useReactToPrint } from "react-to-print"
import { Header } from "@/components/layout/header"
import { DocumentoPreview } from "@/components/documento/documento-preview"
import { DocumentoConfig } from "@/components/documento/documento-config"
import { usePrescricoes } from "@/hooks/use-prescricoes"
import { useConfig } from "@/hooks/use-config"
import { useInstituicoes } from "@/hooks/use-instituicoes"
import { useLocale } from "@/hooks/use-locale"

export default function DocumentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { buscarPorId, isLoaded } = usePrescricoes()
  const { config } = useConfig()
  const { instituicoes, buscarPorId: buscarInst } = useInstituicoes()
  const contentRef = useRef<HTMLDivElement>(null)
  const { t } = useLocale()

  const [tipo, setTipo] = useState<"prescricao" | "atestado">("prescricao")
  const [diasAfastamento, setDiasAfastamento] = useState(1)
  const [incluirCID, setIncluirCID] = useState(false)
  const [cid, setCid] = useState("")
  const [instituicaoId, setInstituicaoId] = useState<string | null>(
    instituicoes.length > 0 ? instituicoes[0].id : null
  )

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `documento-${tipo}`,
  })

  if (!isLoaded) {
    return (
      <>
        <Header title={t("document.title")} />
        <Text color="fg.muted">{t("common.loading")}</Text>
      </>
    )
  }

  const prescricao = buscarPorId(id)

  if (!prescricao) {
    return (
      <>
        <Header title={t("prescriptions.notFound")} />
        <Text color="fg.muted">
          {t("prescriptions.notFoundDesc")}
        </Text>
      </>
    )
  }

  const instituicaoSelecionada = instituicaoId
    ? buscarInst(instituicaoId)
    : undefined

  return (
    <>
      <Header title={t("document.title")} />

      <Flex gap="8" direction={{ base: "column", lg: "row" }}>
        {/* Painel de configuração */}
        <Box
          w={{ base: "100%", lg: "320px" }}
          flexShrink={0}
          p="5"
          borderWidth="1px"
          borderRadius="lg"
          alignSelf="flex-start"
        >
          <DocumentoConfig
            tipo={tipo}
            onTipoChange={setTipo}
            diasAfastamento={diasAfastamento}
            onDiasChange={setDiasAfastamento}
            incluirCID={incluirCID}
            onIncluirCIDChange={setIncluirCID}
            cid={cid}
            onCIDChange={setCid}
            onImprimir={() => handlePrint()}
            instituicoes={instituicoes}
            instituicaoId={instituicaoId}
            onInstituicaoChange={setInstituicaoId}
          />
        </Box>

        {/* Preview do documento */}
        <Box flex="1" overflow="auto">
          <DocumentoPreview
            ref={contentRef}
            prescricao={prescricao}
            config={config}
            instituicao={instituicaoSelecionada}
            tipo={tipo}
            diasAfastamento={diasAfastamento}
            incluirCID={incluirCID}
            cid={cid}
          />
        </Box>
      </Flex>
    </>
  )
}
