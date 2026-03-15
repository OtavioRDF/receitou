"use client"

import { useState } from "react"
import { Box, Flex, Text, IconButton, Badge } from "@chakra-ui/react"
import { LuTrash2, LuPencil, LuPrinter } from "react-icons/lu"
import Link from "next/link"
import type { Prescricao } from "@/types"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useLocale } from "@/hooks/use-locale"

interface PrescricaoCardProps {
  prescricao: Prescricao
  onExcluir: (id: string) => void
}

export function PrescricaoCard({ prescricao, onExcluir }: PrescricaoCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { t, locale } = useLocale()
  const dataFormatada = new Date(prescricao.criadoEm).toLocaleDateString(locale)

  return (
    <>
      <Box
        p="5"
        borderWidth="1px"
        borderRadius="lg"
        _hover={{ shadow: "sm" }}
        transition="all 0.15s"
      >
        <Flex justify="space-between" align="start" mb="3">
          <Box>
            <Link href={`/prescricoes/${prescricao.id}`}>
              <Text fontWeight="semibold" fontSize="lg" _hover={{ color: "blue.500" }}>
                {prescricao.paciente.nome}
              </Text>
            </Link>
            <Text color="fg.muted" fontSize="sm">
              {dataFormatada}
            </Text>
          </Box>
          <Flex gap="1">
            <Link href={`/prescricoes/${prescricao.id}/documento`}>
              <IconButton aria-label={t("prescriptionCard.generateDoc")} variant="ghost" size="sm" colorPalette="green">
                <LuPrinter />
              </IconButton>
            </Link>
            <Link href={`/prescricoes/${prescricao.id}`}>
              <IconButton aria-label={t("common.edit")} variant="ghost" size="sm">
                <LuPencil />
              </IconButton>
            </Link>
            <IconButton
              aria-label={t("common.delete")}
              variant="ghost"
              size="sm"
              colorPalette="red"
              onClick={() => setConfirmOpen(true)}
            >
              <LuTrash2 />
            </IconButton>
          </Flex>
        </Flex>

        <Flex gap="2" flexWrap="wrap">
          {prescricao.medicamentos.map((med) => (
            <Badge key={med.id} variant="subtle" colorPalette="blue" fontSize="xs">
              {med.nome}
            </Badge>
          ))}
        </Flex>

        {prescricao.medicamentos.length === 0 && (
          <Text color="fg.muted" fontSize="sm">
            {t("prescriptions.noMedications")}
          </Text>
        )}
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => onExcluir(prescricao.id)}
        title={t("prescriptionCard.deleteTitle")}
        description={t("prescriptionCard.deleteDesc", { name: prescricao.paciente.nome })}
      />
    </>
  )
}
