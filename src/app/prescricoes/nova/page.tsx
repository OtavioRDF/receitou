"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Text } from "@chakra-ui/react"
import { Header } from "@/components/layout/header"
import { PrescricaoForm } from "@/components/prescricao/prescricao-form"
import { usePrescricoes } from "@/hooks/use-prescricoes"
import { useTemplates } from "@/hooks/use-templates"
import { toaster } from "@/components/ui/toaster"
import { useLocale } from "@/hooks/use-locale"

function NovaPrescricaoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { criar } = usePrescricoes()
  const { buscarPorId } = useTemplates()
  const { t } = useLocale()

  const templateId = searchParams.get("templateId")
  const template = templateId ? buscarPorId(templateId) : undefined

  return (
    <>
      <Header
        title={
          template
            ? t("prescriptions.newFromTemplate", { name: template.nome })
            : t("prescriptions.newTitle")
        }
      />
      <PrescricaoForm
        initialMedicamentos={template?.medicamentos}
        initialObservacoes={template?.observacoes}
        submitLabel={t("prescriptions.create")}
        onSubmit={(data) => {
          criar({ ...data, templateId: templateId ?? undefined })
          toaster.success({ title: t("prescriptions.createdSuccess") })
          router.push("/prescricoes")
        }}
      />
    </>
  )
}

export default function NovaPrescricaoPage() {
  return (
    <Suspense fallback={<Text color="fg.muted">...</Text>}>
      <NovaPrescricaoContent />
    </Suspense>
  )
}
