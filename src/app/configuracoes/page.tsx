"use client"

import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  SimpleGrid,
  VStack,
  Text,
  Image,
  Separator,
} from "@chakra-ui/react"
import { Field } from "@chakra-ui/react"
import { LuPlus, LuPencil, LuTrash2 } from "react-icons/lu"
import { Header } from "@/components/layout/header"
import { useConfig } from "@/hooks/use-config"
import { useInstituicoes } from "@/hooks/use-instituicoes"
import { PhoneInput } from "@/components/ui/phone-input"
import { LogoUpload } from "@/components/ui/logo-upload"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toaster } from "@/components/ui/toaster"
import { useLocale } from "@/hooks/use-locale"
import type { ConfigMedico, Instituicao } from "@/types"
import { useState, useEffect } from "react"

// ── Validação do profissional ──

type FormErrors = Partial<Record<keyof ConfigMedico, string>>

// ── Formulário de Instituição (modal inline) ──

interface InstituicaoFormProps {
  initial?: Instituicao
  onSave: (data: Omit<Instituicao, "id">) => void
  onCancel: () => void
}

function InstituicaoForm({ initial, onSave, onCancel }: InstituicaoFormProps) {
  const { t } = useLocale()
  const [nome, setNome] = useState(initial?.nome ?? "")
  const [endereco, setEndereco] = useState(initial?.endereco ?? "")
  const [telefone, setTelefone] = useState(initial?.telefone ?? "")
  const [logo, setLogo] = useState<string | undefined>(initial?.logo)
  const [nomeError, setNomeError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      setNomeError(t("institutions.nameRequired"))
      return
    }
    onSave({
      nome,
      endereco: endereco || undefined,
      telefone: telefone || undefined,
      logo,
    })
  }

  return (
    <Box p="5" borderWidth="1px" borderRadius="lg" bg="bg.subtle">
      <form onSubmit={handleSubmit}>
        <VStack gap="4" align="stretch">
          <Heading size="sm">
            {initial ? t("institutions.editTitle") : t("institutions.newTitle")}
          </Heading>

          <Field.Root>
            <Field.Label>{t("institutions.logo")}</Field.Label>
            <LogoUpload value={logo} onChange={setLogo} />
          </Field.Root>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <Field.Root required invalid={!!nomeError}>
              <Field.Label>{t("institutions.name")}</Field.Label>
              <Input
                placeholder={t("institutions.namePlaceholder")}
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  if (nomeError) setNomeError("")
                }}
                onBlur={() => {
                  if (!nome.trim()) setNomeError(t("institutions.nameRequiredShort"))
                }}
              />
              {nomeError && (
                <Field.ErrorText>{nomeError}</Field.ErrorText>
              )}
            </Field.Root>
            <Field.Root>
              <Field.Label>{t("institutions.address")}</Field.Label>
              <Input
                placeholder={t("institutions.addressPlaceholder")}
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>{t("common.phone")}</Field.Label>
              <PhoneInput
                value={telefone}
                onChange={setTelefone}
              />
            </Field.Root>
          </SimpleGrid>

          <Flex gap="2">
            <Button type="submit" size="sm" colorPalette="blue">
              {initial ? t("institutions.saveButton") : t("institutions.addButton")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCancel}
            >
              {t("common.cancel")}
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  )
}

// ── Página principal ──

export default function ConfiguracoesPage() {
  const { config, setConfig, isLoaded } = useConfig()
  const {
    instituicoes,
    isLoaded: instLoaded,
    criar: criarInst,
    atualizar: atualizarInst,
    excluir: excluirInst,
  } = useInstituicoes()
  const { t } = useLocale()

  const [form, setForm] = useState<ConfigMedico>(config)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<
    Partial<Record<keyof ConfigMedico, boolean>>
  >({})

  // Instituição state
  const [showInstForm, setShowInstForm] = useState(false)
  const [editingInst, setEditingInst] = useState<Instituicao | undefined>()
  const [deleteInstId, setDeleteInstId] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded) setForm(config)
  }, [isLoaded, config])

  function validate(form: ConfigMedico): FormErrors {
    const errors: FormErrors = {}

    if (!form.nome.trim()) {
      errors.nome = t("validation.nameRequired")
    } else if (form.nome.trim().length < 3) {
      errors.nome = t("validation.nameMin3")
    }

    if (!form.crm.trim()) {
      errors.crm = t("validation.crmRequired")
    } else if (
      !/^[A-Za-z]{0,4}\s?\d{3,7}(\/[A-Z]{2})?$/i.test(form.crm.trim())
    ) {
      errors.crm = t("validation.crmInvalid")
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = t("validation.emailInvalid")
    }

    if (form.telefone && form.telefone.replace(/\D/g, "").length < 8) {
      errors.telefone = t("validation.phoneMin")
    }

    return errors
  }

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const allErrors = validate(form)
      const visibleErrors: FormErrors = {}
      for (const key of Object.keys(touched) as (keyof ConfigMedico)[]) {
        if (touched[key] && allErrors[key]) {
          visibleErrors[key] = allErrors[key]
        }
      }
      setErrors(visibleErrors)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, touched])

  const handleChange = (field: keyof ConfigMedico, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field: keyof ConfigMedico) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    const allTouched: Partial<Record<keyof ConfigMedico, boolean>> = {}
    for (const key of Object.keys(form) as (keyof ConfigMedico)[]) {
      allTouched[key] = true
    }
    setTouched(allTouched)

    const allErrors = validate(form)
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      toaster.error({ title: t("settings.fixErrors") })
      return
    }

    setConfig(form)
    toaster.success({ title: t("settings.savedSuccess") })
  }

  const handleInstSave = (data: Omit<Instituicao, "id">) => {
    if (editingInst) {
      atualizarInst(editingInst.id, data)
      toaster.success({ title: t("institutions.updatedSuccess") })
    } else {
      criarInst(data)
      toaster.success({ title: t("institutions.addedSuccess") })
    }
    setShowInstForm(false)
    setEditingInst(undefined)
  }

  if (!isLoaded || !instLoaded) return null

  const instToDelete = deleteInstId
    ? instituicoes.find((i) => i.id === deleteInstId)
    : null

  return (
    <>
      <Header title={t("settings.title")} />

      <VStack gap="10" align="stretch" maxW="800px">
        {/* ── Dados do Profissional ── */}
        <form onSubmit={handleSave} noValidate>
          <VStack gap="6" align="stretch">
            <Heading size="md">{t("settings.professional")}</Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              <Field.Root required invalid={!!errors.nome}>
                <Field.Label>{t("settings.fullName")}</Field.Label>
                <Input
                  placeholder={t("settings.fullNamePlaceholder")}
                  value={form.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  onBlur={() => handleBlur("nome")}
                />
                {errors.nome && (
                  <Field.ErrorText>{errors.nome}</Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root required invalid={!!errors.crm}>
                <Field.Label>{t("settings.crm")}</Field.Label>
                <Input
                  placeholder={t("settings.crmPlaceholder")}
                  value={form.crm}
                  onChange={(e) => handleChange("crm", e.target.value)}
                  onBlur={() => handleBlur("crm")}
                />
                {errors.crm && (
                  <Field.ErrorText>{errors.crm}</Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root>
                <Field.Label>{t("settings.specialty")}</Field.Label>
                <Input
                  placeholder={t("settings.specialtyPlaceholder")}
                  value={form.especialidade ?? ""}
                  onChange={(e) =>
                    handleChange("especialidade", e.target.value)
                  }
                />
              </Field.Root>

              <Field.Root invalid={!!errors.telefone}>
                <Field.Label>{t("common.phone")}</Field.Label>
                <PhoneInput
                  value={form.telefone ?? ""}
                  onChange={(phone) => handleChange("telefone", phone)}
                />
                {errors.telefone && (
                  <Field.ErrorText>{errors.telefone}</Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root invalid={!!errors.email}>
                <Field.Label>{t("settings.email")}</Field.Label>
                <Input
                  type="email"
                  placeholder={t("settings.emailPlaceholder")}
                  value={form.email ?? ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                />
                {errors.email && (
                  <Field.ErrorText>{errors.email}</Field.ErrorText>
                )}
              </Field.Root>
            </SimpleGrid>

            <Button
              type="submit"
              colorPalette="blue"
              alignSelf="flex-start"
            >
              {t("settings.saveConfig")}
            </Button>
          </VStack>
        </form>

        <Separator />

        {/* ── Instituições / Cabeçalhos ── */}
        <Box>
          <Flex justify="space-between" align="center" mb="4">
            <Heading size="md">{t("institutions.title")}</Heading>
            {!showInstForm && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingInst(undefined)
                  setShowInstForm(true)
                }}
              >
                <LuPlus />
                {t("institutions.new")}
              </Button>
            )}
          </Flex>

          <VStack gap="4" align="stretch">
            {/* Form de criação/edição */}
            {showInstForm && (
              <InstituicaoForm
                initial={editingInst}
                onSave={handleInstSave}
                onCancel={() => {
                  setShowInstForm(false)
                  setEditingInst(undefined)
                }}
              />
            )}

            {/* Lista de instituições */}
            {instituicoes.length === 0 && !showInstForm && (
              <Text color="fg.muted" fontSize="sm">
                {t("institutions.empty")}
              </Text>
            )}

            {instituicoes.map((inst) => (
              <Box
                key={inst.id}
                p="4"
                borderWidth="1px"
                borderRadius="lg"
                _hover={{ shadow: "sm" }}
                transition="all 0.15s"
              >
                <Flex align="center" gap="4">
                  {inst.logo && (
                    <Image
                      src={inst.logo}
                      alt={inst.nome}
                      maxH="50px"
                      maxW="120px"
                      objectFit="contain"
                      flexShrink={0}
                    />
                  )}
                  <Box flex="1" minW="0">
                    <Text fontWeight="semibold">{inst.nome}</Text>
                    {inst.endereco && (
                      <Text fontSize="sm" color="fg.muted" truncate>
                        {inst.endereco}
                      </Text>
                    )}
                    {inst.telefone && (
                      <Text fontSize="sm" color="fg.muted">
                        {inst.telefone}
                      </Text>
                    )}
                  </Box>
                  <Flex gap="1" flexShrink={0}>
                    <IconButton
                      aria-label={t("common.edit")}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingInst(inst)
                        setShowInstForm(true)
                      }}
                    >
                      <LuPencil />
                    </IconButton>
                    <IconButton
                      aria-label={t("common.delete")}
                      variant="ghost"
                      size="sm"
                      colorPalette="red"
                      onClick={() => setDeleteInstId(inst.id)}
                    >
                      <LuTrash2 />
                    </IconButton>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      </VStack>

      <ConfirmDialog
        open={!!deleteInstId}
        onClose={() => setDeleteInstId(null)}
        onConfirm={() => {
          if (deleteInstId) excluirInst(deleteInstId)
        }}
        title={t("institutions.deleteTitle")}
        description={t("institutions.deleteDesc", { name: instToDelete?.nome ?? "" })}
      />
    </>
  )
}
