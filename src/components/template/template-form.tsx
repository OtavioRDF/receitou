"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  NativeSelectField,
  NativeSelectIndicator,
  NativeSelectRoot,
  Text,
  Textarea,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react"
import { LuPlus, LuTrash2 } from "react-icons/lu"
import type { Medication } from "@/types"
import { Field } from "@chakra-ui/react"
import { toaster } from "@/components/ui/toaster"
import { useLocale } from "@/hooks/use-locale"
import { MEDICATION_ROUTES } from "@/lib/medication-routes"

interface TemplateFormProps {
  initialName?: string
  initialDescription?: string
  initialMedications?: Medication[]
  initialNotes?: string
  onSubmit: (data: {
    name: string
    description?: string
    medications: Medication[]
    notes?: string
  }) => void
  submitLabel?: string
}

function createEmptyMedication(): Medication {
  return {
    id: crypto.randomUUID(),
    name: "",
    dosage: "",
    route: "Oral",
    frequency: "",
    duration: "",
    notes: "",
  }
}

interface FormErrors {
  name?: string
  medications?: Record<string, Record<string, string>>
}

export function TemplateForm({
  initialName,
  initialDescription,
  initialMedications,
  initialNotes,
  onSubmit,
  submitLabel,
}: TemplateFormProps) {
  const { t } = useLocale()

  const [name, setName] = useState(initialName ?? "")
  const [description, setDescription] = useState(initialDescription ?? "")
  const [medications, setMedications] = useState<Medication[]>(
    initialMedications ?? [createEmptyMedication()]
  )
  const [notes, setNotes] = useState(initialNotes ?? "")
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  function validate(name: string, medications: Medication[]): FormErrors {
    const errors: FormErrors = {}

    if (!name.trim()) {
      errors.name = t("validation.templateNameRequired")
    } else if (name.trim().length < 2) {
      errors.name = t("validation.templateNameMin")
    }

    const medErrors: Record<string, Record<string, string>> = {}
    const filledMeds = medications.filter(
      (m) => m.name.trim() || m.dosage.trim() || m.frequency.trim()
    )

    filledMeds.forEach((med) => {
      const errs: Record<string, string> = {}
      if (!med.name.trim()) errs.name = t("validation.medNameRequired")
      if (!med.dosage.trim()) errs.dosage = t("validation.medDosageRequired")
      if (!med.frequency.trim()) errs.frequency = t("validation.medFrequencyRequired")
      if (Object.keys(errs).length > 0) medErrors[med.id] = errs
    })

    if (Object.keys(medErrors).length > 0) errors.medications = medErrors

    return errors
  }

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const allErrors = validate(name, medications)
      const visibleErrors: FormErrors = {}

      if (touched.name && allErrors.name) {
        visibleErrors.name = allErrors.name
      }
      if (allErrors.medications) {
        const visibleMedErrors: Record<string, Record<string, string>> = {}
        for (const [medId, medErrs] of Object.entries(allErrors.medications)) {
          const visible: Record<string, string> = {}
          for (const [field, msg] of Object.entries(medErrs)) {
            if (touched[`med_${medId}_${field}`]) visible[field] = msg
          }
          if (Object.keys(visible).length > 0) visibleMedErrors[medId] = visible
        }
        if (Object.keys(visibleMedErrors).length > 0) {
          visibleErrors.medications = visibleMedErrors
        }
      }

      setErrors(visibleErrors)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, medications, touched])

  const handleBlur = (key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  const touchAll = () => {
    const allTouched: Record<string, boolean> = { name: true }
    medications.forEach((med) => {
      allTouched[`med_${med.id}_name`] = true
      allTouched[`med_${med.id}_dosage`] = true
      allTouched[`med_${med.id}_frequency`] = true
    })
    setTouched(allTouched)
  }

  const addMedication = () => {
    setMedications((prev) => [...prev, createEmptyMedication()])
  }

  const removeMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id))
  }

  const updateMedication = (
    id: string,
    field: keyof Medication,
    value: string
  ) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  const getMedError = (medId: string, field: string) =>
    errors.medications?.[medId]?.[field]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    touchAll()

    const allErrors = validate(name, medications)
    if (
      allErrors.name ||
      (allErrors.medications && Object.keys(allErrors.medications).length > 0)
    ) {
      setErrors(allErrors)
      toaster.error({ title: t("templateForm.fixErrors") })
      return
    }

    onSubmit({
      name,
      description: description || undefined,
      medications: medications.filter((m) => m.name.trim() !== ""),
      notes: notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <VStack gap="6" align="stretch">
        {/* Template Info */}
        <Box>
          <Heading size="md" mb="4">
            {t("templateForm.info")}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <Field.Root required invalid={!!errors.name}>
              <Field.Label>{t("templateForm.name")}</Field.Label>
              <Input
                placeholder={t("templateForm.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur("name")}
              />
              {errors.name && (
                <Field.ErrorText>{errors.name}</Field.ErrorText>
              )}
            </Field.Root>
            <Field.Root>
              <Field.Label>{t("templateForm.description")}</Field.Label>
              <Input
                placeholder={t("templateForm.descPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field.Root>
          </SimpleGrid>
        </Box>

        {/* Medications */}
        <Box>
          <Flex justify="space-between" align="center" mb="4">
            <Heading size="md">{t("medications.title")}</Heading>
            <Button size="sm" variant="outline" onClick={addMedication}>
              <LuPlus />
              {t("common.add")}
            </Button>
          </Flex>

          <VStack gap="4" align="stretch">
            {medications.map((med, index) => (
              <Box
                key={med.id}
                p="4"
                borderWidth="1px"
                borderRadius="md"
                borderColor={
                  errors.medications?.[med.id] ? "red.500" : undefined
                }
              >
                <Flex justify="space-between" align="center" mb="3">
                  <Text fontWeight="medium" fontSize="sm" color="fg.muted">
                    {t("medications.medication")} {index + 1}
                  </Text>
                  {medications.length > 1 && (
                    <IconButton
                      aria-label={t("medications.remove")}
                      variant="ghost"
                      size="xs"
                      colorPalette="red"
                      onClick={() => removeMedication(med.id)}
                    >
                      <LuTrash2 />
                    </IconButton>
                  )}
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                  <Field.Root required invalid={!!getMedError(med.id, "name")}>
                    <Field.Label>{t("medications.name")}</Field.Label>
                    <Input
                      placeholder={t("medications.namePlaceholder")}
                      value={med.name}
                      onChange={(e) =>
                        updateMedication(med.id, "name", e.target.value)
                      }
                      onBlur={() => handleBlur(`med_${med.id}_name`)}
                    />
                    {getMedError(med.id, "name") && (
                      <Field.ErrorText>
                        {getMedError(med.id, "name")}
                      </Field.ErrorText>
                    )}
                  </Field.Root>
                  <Field.Root required invalid={!!getMedError(med.id, "dosage")}>
                    <Field.Label>{t("medications.dosage")}</Field.Label>
                    <Input
                      placeholder={t("medications.dosagePlaceholder")}
                      value={med.dosage}
                      onChange={(e) =>
                        updateMedication(med.id, "dosage", e.target.value)
                      }
                      onBlur={() => handleBlur(`med_${med.id}_dosage`)}
                    />
                    {getMedError(med.id, "dosage") && (
                      <Field.ErrorText>
                        {getMedError(med.id, "dosage")}
                      </Field.ErrorText>
                    )}
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t("medications.route")}</Field.Label>
                    <NativeSelectRoot>
                      <NativeSelectField
                        value={med.route}
                        onChange={(e) =>
                          updateMedication(med.id, "route", e.target.value)
                        }
                      >
                        <option value="">{t("medications.routeSelect")}</option>
                        {MEDICATION_ROUTES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {t(r.labelKey)}
                          </option>
                        ))}
                      </NativeSelectField>
                      <NativeSelectIndicator />
                    </NativeSelectRoot>
                  </Field.Root>
                  <Field.Root required invalid={!!getMedError(med.id, "frequency")}>
                    <Field.Label>{t("medications.frequency")}</Field.Label>
                    <Input
                      placeholder={t("medications.frequencyPlaceholder")}
                      value={med.frequency}
                      onChange={(e) =>
                        updateMedication(med.id, "frequency", e.target.value)
                      }
                      onBlur={() => handleBlur(`med_${med.id}_frequency`)}
                    />
                    {getMedError(med.id, "frequency") && (
                      <Field.ErrorText>
                        {getMedError(med.id, "frequency")}
                      </Field.ErrorText>
                    )}
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t("medications.duration")}</Field.Label>
                    <Input
                      placeholder={t("medications.durationPlaceholder")}
                      value={med.duration ?? ""}
                      onChange={(e) =>
                        updateMedication(med.id, "duration", e.target.value)
                      }
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t("medications.observations")}</Field.Label>
                    <Input
                      placeholder={t("medications.observationsPlaceholder")}
                      value={med.notes ?? ""}
                      onChange={(e) =>
                        updateMedication(med.id, "notes", e.target.value)
                      }
                    />
                  </Field.Root>
                </SimpleGrid>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* General Notes */}
        <Field.Root>
          <Field.Label>{t("templateForm.generalObs")}</Field.Label>
          <Textarea
            placeholder={t("templateForm.generalObsPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </Field.Root>

        <Button type="submit" colorPalette="blue" alignSelf="flex-start">
          {submitLabel ?? t("common.save")}
        </Button>
      </VStack>
    </form>
  )
}
