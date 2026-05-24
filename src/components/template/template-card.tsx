"use client"

import { useState } from "react"
import { Box, Flex, Text, IconButton, Badge } from "@chakra-ui/react"
import { LuTrash2, LuPencil, LuCopy } from "react-icons/lu"
import Link from "next/link"
import type { Template } from "@/types"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useLocale } from "@/hooks/use-locale"

interface TemplateCardProps {
  template: Template
  onRemove: (id: string) => void
  onUse?: (template: Template) => void
}

export function TemplateCard({ template, onRemove, onUse }: TemplateCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { t } = useLocale()

  return (
    <>
      <Box
        p="5"
        borderWidth="1px"
        borderRadius="lg"
        _hover={{ shadow: "sm" }}
        transition="all 0.15s"
      >
        <Flex justify="space-between" align="start" mb="2">
          <Box>
            <Link href={`/templates/${template.id}`}>
              <Text fontWeight="semibold" fontSize="lg" _hover={{ color: "blue.500" }}>
                {template.name}
              </Text>
            </Link>
            {template.description && (
              <Text color="fg.muted" fontSize="sm" mt="1">
                {template.description}
              </Text>
            )}
          </Box>
          <Flex gap="1">
            {onUse && (
              <IconButton
                aria-label={t("templates.useTemplate")}
                variant="ghost"
                size="sm"
                colorPalette="green"
                onClick={() => onUse(template)}
              >
                <LuCopy />
              </IconButton>
            )}
            <Link href={`/templates/${template.id}`}>
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

        <Flex gap="2" flexWrap="wrap" mt="3">
          {template.medications.map((med) => (
            <Badge key={med.id} variant="subtle" colorPalette="purple" fontSize="xs">
              {med.name}
            </Badge>
          ))}
        </Flex>

        {template.medications.length === 0 && (
          <Text color="fg.muted" fontSize="sm" mt="2">
            {t("templates.noMedications")}
          </Text>
        )}
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => onRemove(template.id)}
        title={t("templateCard.deleteTitle")}
        description={t("templateCard.deleteDesc", { name: template.name })}
      />
    </>
  )
}
