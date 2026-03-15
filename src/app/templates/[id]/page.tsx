"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Text } from "@chakra-ui/react"
import { Header } from "@/components/layout/header"
import { TemplateForm } from "@/components/template/template-form"
import { useTemplates } from "@/hooks/use-templates"
import { toaster } from "@/components/ui/toaster"
import { useLocale } from "@/hooks/use-locale"

export default function EditarTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { buscarPorId, atualizar, isLoaded } = useTemplates()
  const { t } = useLocale()

  if (!isLoaded) {
    return (
      <>
        <Header title={t("templates.editTitle")} />
        <Text color="fg.muted">{t("common.loading")}</Text>
      </>
    )
  }

  const template = buscarPorId(id)

  if (!template) {
    return (
      <>
        <Header title={t("templates.notFound")} />
        <Text color="fg.muted">
          {t("templates.notFoundDesc")}
        </Text>
      </>
    )
  }

  return (
    <>
      <Header title={t("templates.editTitle")} />
      <TemplateForm
        initialNome={template.nome}
        initialDescricao={template.descricao}
        initialMedicamentos={template.medicamentos}
        initialObservacoes={template.observacoes}
        submitLabel={t("templates.saveChanges")}
        onSubmit={(data) => {
          atualizar(id, data)
          toaster.success({ title: t("templates.updatedSuccess") })
          router.push("/templates")
        }}
      />
    </>
  )
}
