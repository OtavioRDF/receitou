"use client"

import { VStack, Text, Button } from "@chakra-ui/react"
import { LuPlus } from "react-icons/lu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { TemplateCard } from "@/components/template/template-card"
import { useTemplates } from "@/hooks/use-templates"
import { useLocale } from "@/hooks/use-locale"
import type { Template } from "@/types"

export default function TemplatesPage() {
  const router = useRouter()
  const { templates, isLoaded, remove } = useTemplates()
  const { t } = useLocale()

  const handleUse = (template: Template) => {
    const params = new URLSearchParams({ templateId: template.id })
    router.push(`/prescriptions/new?${params}`)
  }

  return (
    <>
      <Header title={t("templates.title")}>
        <Link href="/templates/new">
          <Button size="sm" colorPalette="blue">
            <LuPlus />
            {t("templates.new")}
          </Button>
        </Link>
      </Header>

      {!isLoaded ? (
        <Text color="fg.muted">{t("common.loading")}</Text>
      ) : templates.length === 0 ? (
        <VStack py="16" gap="4">
          <Text color="fg.muted" fontSize="lg">
            {t("templates.empty")}
          </Text>
          <Link href="/templates/new">
            <Button colorPalette="blue">
              <LuPlus />
              {t("templates.createFirst")}
            </Button>
          </Link>
        </VStack>
      ) : (
        <VStack gap="4" align="stretch">
          {templates.map((tmpl) => (
            <TemplateCard
              key={tmpl.id}
              template={tmpl}
              onRemove={remove}
              onUse={handleUse}
            />
          ))}
        </VStack>
      )}
    </>
  )
}
