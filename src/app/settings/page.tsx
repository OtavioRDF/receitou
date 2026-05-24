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
import { useInstitutions } from "@/hooks/use-institutions"
import { PhoneInput } from "@/components/ui/phone-input"
import { LogoUpload } from "@/components/ui/logo-upload"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toaster } from "@/components/ui/toaster"
import { useLocale } from "@/hooks/use-locale"
import type { DoctorConfig, Institution } from "@/types"
import { useState, useEffect } from "react"

// ── Professional validation ──

type FormErrors = Partial<Record<keyof DoctorConfig, string>>

// ── Institution Form (inline) ──

interface InstitutionFormProps {
  initial?: Institution
  onSave: (data: Omit<Institution, "id">) => void
  onCancel: () => void
}

function InstitutionForm({ initial, onSave, onCancel }: InstitutionFormProps) {
  const { t } = useLocale()
  const [name, setName] = useState(initial?.name ?? "")
  const [address, setAddress] = useState(initial?.address ?? "")
  const [phone, setPhone] = useState(initial?.phone ?? "")
  const [logo, setLogo] = useState<string | undefined>(initial?.logo)
  const [nameError, setNameError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setNameError(t("institutions.nameRequired"))
      return
    }
    onSave({
      name,
      address: address || undefined,
      phone: phone || undefined,
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
            <Field.Root required invalid={!!nameError}>
              <Field.Label>{t("institutions.name")}</Field.Label>
              <Input
                placeholder={t("institutions.namePlaceholder")}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (nameError) setNameError("")
                }}
                onBlur={() => {
                  if (!name.trim()) setNameError(t("institutions.nameRequiredShort"))
                }}
              />
              {nameError && (
                <Field.ErrorText>{nameError}</Field.ErrorText>
              )}
            </Field.Root>
            <Field.Root>
              <Field.Label>{t("institutions.address")}</Field.Label>
              <Input
                placeholder={t("institutions.addressPlaceholder")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>{t("common.phone")}</Field.Label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
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

// ── Main Page ──

export default function SettingsPage() {
  const { config, setConfig, isLoaded } = useConfig()
  const {
    institutions,
    isLoaded: instLoaded,
    create: createInst,
    update: updateInst,
    remove: removeInst,
  } = useInstitutions()
  const { t } = useLocale()

  const [form, setForm] = useState<DoctorConfig>(config)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<
    Partial<Record<keyof DoctorConfig, boolean>>
  >({})

  // Institution state
  const [showInstForm, setShowInstForm] = useState(false)
  const [editingInst, setEditingInst] = useState<Institution | undefined>()
  const [deleteInstId, setDeleteInstId] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded) setForm(config)
  }, [isLoaded, config])

  function validate(form: DoctorConfig): FormErrors {
    const errors: FormErrors = {}

    if (!form.name.trim()) {
      errors.name = t("validation.nameRequired")
    } else if (form.name.trim().length < 3) {
      errors.name = t("validation.nameMin3")
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

    if (form.phone && form.phone.replace(/\D/g, "").length < 8) {
      errors.phone = t("validation.phoneMin")
    }

    return errors
  }

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const allErrors = validate(form)
      const visibleErrors: FormErrors = {}
      for (const key of Object.keys(touched) as (keyof DoctorConfig)[]) {
        if (touched[key] && allErrors[key]) {
          visibleErrors[key] = allErrors[key]
        }
      }
      setErrors(visibleErrors)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, touched])

  const handleChange = (field: keyof DoctorConfig, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field: keyof DoctorConfig) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    const allTouched: Partial<Record<keyof DoctorConfig, boolean>> = {}
    for (const key of Object.keys(form) as (keyof DoctorConfig)[]) {
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

  const handleInstSave = (data: Omit<Institution, "id">) => {
    if (editingInst) {
      updateInst(editingInst.id, data)
      toaster.success({ title: t("institutions.updatedSuccess") })
    } else {
      createInst(data)
      toaster.success({ title: t("institutions.addedSuccess") })
    }
    setShowInstForm(false)
    setEditingInst(undefined)
  }

  if (!isLoaded || !instLoaded) return null

  const instToDelete = deleteInstId
    ? institutions.find((i) => i.id === deleteInstId)
    : null

  return (
    <>
      <Header title={t("settings.title")} />

      <VStack gap="10" align="stretch" maxW="800px">
        {/* ── Professional Data ── */}
        <form onSubmit={handleSave} noValidate>
          <VStack gap="6" align="stretch">
            <Heading size="md">{t("settings.professional")}</Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              <Field.Root required invalid={!!errors.name}>
                <Field.Label>{t("settings.fullName")}</Field.Label>
                <Input
                  placeholder={t("settings.fullNamePlaceholder")}
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                />
                {errors.name && (
                  <Field.ErrorText>{errors.name}</Field.ErrorText>
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
                  value={form.specialty ?? ""}
                  onChange={(e) =>
                    handleChange("specialty", e.target.value)
                  }
                />
              </Field.Root>

              <Field.Root invalid={!!errors.phone}>
                <Field.Label>{t("common.phone")}</Field.Label>
                <PhoneInput
                  value={form.phone ?? ""}
                  onChange={(p) => handleChange("phone", p)}
                />
                {errors.phone && (
                  <Field.ErrorText>{errors.phone}</Field.ErrorText>
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

        {/* ── Institutions ── */}
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
            {showInstForm && (
              <InstitutionForm
                initial={editingInst}
                onSave={handleInstSave}
                onCancel={() => {
                  setShowInstForm(false)
                  setEditingInst(undefined)
                }}
              />
            )}

            {institutions.length === 0 && !showInstForm && (
              <Text color="fg.muted" fontSize="sm">
                {t("institutions.empty")}
              </Text>
            )}

            {institutions.map((inst) => (
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
                      alt={inst.name}
                      maxH="50px"
                      maxW="120px"
                      objectFit="contain"
                      flexShrink={0}
                    />
                  )}
                  <Box flex="1" minW="0">
                    <Text fontWeight="semibold">{inst.name}</Text>
                    {inst.address && (
                      <Text fontSize="sm" color="fg.muted" truncate>
                        {inst.address}
                      </Text>
                    )}
                    {inst.phone && (
                      <Text fontSize="sm" color="fg.muted">
                        {inst.phone}
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
          if (deleteInstId) removeInst(deleteInstId)
        }}
        title={t("institutions.deleteTitle")}
        description={t("institutions.deleteDesc", { name: instToDelete?.name ?? "" })}
      />
    </>
  )
}
