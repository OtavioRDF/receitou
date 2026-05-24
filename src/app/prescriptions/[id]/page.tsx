"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Text } from "@chakra-ui/react"
import { Header } from "@/components/layout/header"
import { PrescriptionForm } from "@/components/prescricao/prescription-form"
import { usePrescriptions } from "@/hooks/use-prescriptions"
import { toaster } from "@/components/ui/toaster"
import { useLocale } from "@/hooks/use-locale"

export default function EditPrescriptionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { findById, update, isLoaded } = usePrescriptions()
  const { t } = useLocale()

  if (!isLoaded) {
    return (
      <>
        <Header title={t("prescriptions.editTitle")} />
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

  return (
    <>
      <Header title={t("prescriptions.editTitle")} />
      <PrescriptionForm
        initialPatient={prescription.patient}
        initialMedications={prescription.medications}
        initialNotes={prescription.notes}
        submitLabel={t("prescriptions.saveChanges")}
        onSubmit={(data) => {
          update(id, data)
          toaster.success({ title: t("prescriptions.updatedSuccess") })
          router.push("/prescriptions")
        }}
      />
    </>
  )
}
