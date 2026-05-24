"use client"

import { use, useRef, useState } from "react"
import { Box, Flex, Text } from "@chakra-ui/react"
import { useReactToPrint } from "react-to-print"
import { Header } from "@/components/layout/header"
import { DocumentPreview } from "@/components/documento/document-preview"
import { DocumentConfig } from "@/components/documento/document-config"
import { usePrescriptions } from "@/hooks/use-prescriptions"
import { useConfig } from "@/hooks/use-config"
import { useInstitutions } from "@/hooks/use-institutions"
import { useLocale } from "@/hooks/use-locale"

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { findById, isLoaded } = usePrescriptions()
  const { config } = useConfig()
  const { institutions, findById: findInst } = useInstitutions()
  const contentRef = useRef<HTMLDivElement>(null)
  const { t } = useLocale()

  const [type, setType] = useState<"prescricao" | "atestado" | "declaracao">("prescricao")
  const [daysOff, setDaysOff] = useState(1)
  const [includeCID, setIncludeCID] = useState(false)
  const [cid, setCid] = useState("")
  const [institutionId, setInstitutionId] = useState<string | null>(
    institutions.length > 0 ? institutions[0].id : null
  )

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `document-${type}`,
  })

  if (!isLoaded) {
    return (
      <>
        <Header title={t("document.title")} />
        <Text color="fg.muted">{t("common.loading")}</Text>
      </>
    )
  }

  const prescription = findById(id)

  if (!prescription) {
    return (
      <>
        <Header title={t("prescriptions.notFound")} />
        <Text color="fg.muted">
          {t("prescriptions.notFoundDesc")}
        </Text>
      </>
    )
  }

  const selectedInstitution = institutionId
    ? findInst(institutionId)
    : undefined

  return (
    <>
      <Header title={t("document.title")} />

      <Flex gap="8" direction={{ base: "column", lg: "row" }}>
        {/* Config panel */}
        <Box
          w={{ base: "100%", lg: "320px" }}
          flexShrink={0}
          p="5"
          borderWidth="1px"
          borderRadius="lg"
          alignSelf="flex-start"
        >
          <DocumentConfig
            type={type}
            onTypeChange={setType}
            daysOff={daysOff}
            onDaysChange={setDaysOff}
            includeCID={includeCID}
            onIncludeCIDChange={setIncludeCID}
            cid={cid}
            onCIDChange={setCid}
            onPrint={() => handlePrint()}
            institutions={institutions}
            institutionId={institutionId}
            onInstitutionChange={setInstitutionId}
          />
        </Box>

        {/* Document preview */}
        <Box flex="1" overflow="auto">
          <DocumentPreview
            ref={contentRef}
            prescription={prescription}
            config={config}
            institution={selectedInstitution}
            type={type}
            daysOff={daysOff}
            includeCID={includeCID}
            cid={cid}
          />
        </Box>
      </Flex>
    </>
  )
}
