"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { TemplateForm } from "@/components/template/template-form"
import { useTemplates } from "@/hooks/use-templates"
import { toaster } from "@/components/ui/toaster"
import { useLocale } from "@/hooks/use-locale"

export default function NovoTemplatePage() {
  const router = useRouter()
  const { criar } = useTemplates()
  const { t } = useLocale()

  return (
    <>
      <Header title={t("templates.newTitle")} />
      <TemplateForm
        submitLabel={t("templates.create")}
        onSubmit={(data) => {
          criar(data)
          toaster.success({ title: t("templates.createdSuccess") })
          router.push("/templates")
        }}
      />
    </>
  )
}
