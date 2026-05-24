"use client"

import { useState } from "react"
import { Box, Flex, Text, IconButton, Badge } from "@chakra-ui/react"
import { LuTrash2, LuPencil, LuPrinter, LuCopy } from "react-icons/lu"
import Link from "next/link"
import type { Prescription } from "@/types"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useLocale } from "@/hooks/use-locale"

interface PrescriptionCardProps {
  prescription: Prescription
  onRemove: (id: string) => void
  onDuplicate?: (id: string) => void
}

export function PrescriptionCard({ prescription, onRemove, onDuplicate }: PrescriptionCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { t, locale } = useLocale()
  const formattedDate = new Date(prescription.createdAt).toLocaleDateString(locale)

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
            <Link href={`/prescriptions/${prescription.id}`}>
              <Text fontWeight="semibold" fontSize="lg" _hover={{ color: "blue.500" }}>
                {prescription.patient.name}
              </Text>
            </Link>
            <Text color="fg.muted" fontSize="sm">
              {formattedDate}
            </Text>
          </Box>
          <Flex gap="1">
            <Link href={`/prescriptions/${prescription.id}/document`}>
              <IconButton aria-label={t("prescriptionCard.generateDoc")} variant="ghost" size="sm" colorPalette="green">
                <LuPrinter />
              </IconButton>
            </Link>
            {onDuplicate && (
              <IconButton
                aria-label={t("prescriptions.duplicate")}
                variant="ghost"
                size="sm"
                colorPalette="blue"
                onClick={() => onDuplicate(prescription.id)}
              >
                <LuCopy />
              </IconButton>
            )}
            <Link href={`/prescriptions/${prescription.id}`}>
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
          {prescription.medications.map((med) => (
            <Badge key={med.id} variant="subtle" colorPalette="blue" fontSize="xs">
              {med.name}
            </Badge>
          ))}
        </Flex>

        {prescription.medications.length === 0 && (
          <Text color="fg.muted" fontSize="sm">
            {t("prescriptions.noMedications")}
          </Text>
        )}
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => onRemove(prescription.id)}
        title={t("prescriptionCard.deleteTitle")}
        description={t("prescriptionCard.deleteDesc", { name: prescription.patient.name })}
      />
    </>
  )
}
