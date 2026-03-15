"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Text } from "@chakra-ui/react"
import { Header } from "@/components/layout/header"
import { PrescricaoForm } from "@/components/prescricao/prescricao-form"
import { usePrescricoes } from "@/hooks/use-prescricoes"
import { toaster } from "@/components/ui/toaster"
import { useLocale } from "@/hooks/use-locale"

export default function EditarPrescricaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { buscarPorId, atualizar, isLoaded } = usePrescricoes()
  const { t } = useLocale()

  if (!isLoaded) {
    return (
      <>
        <Header title={t("prescriptions.editTitle")} />
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

  return (
    <>
      <Header title={t("prescriptions.editTitle")} />
      <PrescricaoForm
        initialPaciente={prescricao.paciente}
        initialMedicamentos={prescricao.medicamentos}
        initialObservacoes={prescricao.observacoes}
        submitLabel={t("prescriptions.saveChanges")}
        onSubmit={(data) => {
          atualizar(id, data)
          toaster.success({ title: t("prescriptions.updatedSuccess") })
          router.push("/prescricoes")
        }}
      />
    </>
  )
}
