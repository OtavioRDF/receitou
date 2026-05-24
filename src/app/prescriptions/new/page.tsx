"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Text } from "@chakra-ui/react"
import { Header } from "@/components/layout/header"
import { PrescriptionForm } from "@/components/prescricao/prescription-form"
import { usePrescriptions } from "@/hooks/use-prescriptions"
import { useTemplates } from "@/hooks/use-templates"
import { toaster } from "@/components/ui/toaster"
import { useLocale } from "@/hooks/use-locale"

function NewPrescriptionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { create } = usePrescriptions()
  const { findById } = useTemplates()
  const { t } = useLocale()

  const templateId = searchParams.get("templateId")
  const template = templateId ? findById(templateId) : undefined

  return (
    <>
      <Header
        title={
          template
            ? t("prescriptions.newFromTemplate", { name: template.name })
            : t("prescriptions.newTitle")
        }
      />
      <PrescriptionForm
        initialMedications={template?.medications}
        initialNotes={template?.notes}
        submitLabel={t("prescriptions.create")}
        onSubmit={(data) => {
          create({ ...data, templateId: templateId ?? undefined })
          toaster.success({ title: t("prescriptions.createdSuccess") })
          router.push("/prescriptions")
        }}
      />
    </>
  )
}

export default function NewPrescriptionPage() {
  return (
    <Suspense fallback={<Text color="fg.muted">...</Text>}>
      <NewPrescriptionContent />
    </Suspense>
  )
}
