"use client"

import { VStack, Text, Button } from "@chakra-ui/react"
import { LuPlus } from "react-icons/lu"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { PrescricaoCard } from "@/components/prescricao/prescricao-card"
import { usePrescricoes } from "@/hooks/use-prescricoes"
import { useLocale } from "@/hooks/use-locale"

export default function PrescricoesPage() {
  const { prescricoes, isLoaded, excluir } = usePrescricoes()
  const { t } = useLocale()

  return (
    <>
      <Header title={t("prescriptions.title")}>
        <Link href="/prescricoes/nova">
          <Button size="sm" colorPalette="blue">
            <LuPlus />
            {t("prescriptions.new")}
          </Button>
        </Link>
      </Header>

      {!isLoaded ? (
        <Text color="fg.muted">{t("common.loading")}</Text>
      ) : prescricoes.length === 0 ? (
        <VStack py="16" gap="4">
          <Text color="fg.muted" fontSize="lg">
            {t("prescriptions.empty")}
          </Text>
          <Link href="/prescricoes/nova">
            <Button colorPalette="blue">
              <LuPlus />
              {t("prescriptions.createFirst")}
            </Button>
          </Link>
        </VStack>
      ) : (
        <VStack gap="4" align="stretch">
          {prescricoes.map((p) => (
            <PrescricaoCard key={p.id} prescricao={p} onExcluir={excluir} />
          ))}
        </VStack>
      )}
    </>
  )
}
