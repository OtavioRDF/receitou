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
  Badge,
} from "@chakra-ui/react"
import { LuPlus, LuTrash2 } from "react-icons/lu"
import type { Medication, Patient, WeightUnit, HeightUnit } from "@/types"
import type { TranslationKey } from "@/locales"
import { Field } from "@chakra-ui/react"
import { toaster } from "@/components/ui/toaster"
import { useLocale } from "@/hooks/use-locale"
import { MeasurementInput } from "@/components/ui/measurement-input"
import { MEDICATION_ROUTES } from "@/lib/medication-routes"

interface PrescriptionFormProps {
  initialPatient?: Patient
  initialMedications?: Medication[]
  initialNotes?: string
  onSubmit: (data: {
    patient: Patient
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

function calculateBMI(patient: Patient): number | null {
  if (!patient.weight || !patient.height) return null

  let weightKg = patient.weight
  if (patient.weightUnit === "lb") weightKg = patient.weight * 0.453592

  let heightM = patient.height
  if ((patient.heightUnit ?? "cm") === "cm") heightM = patient.height / 100

  if (heightM <= 0 || weightKg <= 0) return null
  return weightKg / (heightM * heightM)
}

function classifyBMI(bmi: number): { labelKey: TranslationKey; color: string } {
  if (bmi < 18.5) return { labelKey: "prescriptionForm.bmiClassification.underweight", color: "yellow" }
  if (bmi < 25) return { labelKey: "prescriptionForm.bmiClassification.normal", color: "green" }
  if (bmi < 30) return { labelKey: "prescriptionForm.bmiClassification.overweight", color: "orange" }
  if (bmi < 35) return { labelKey: "prescriptionForm.bmiClassification.obese1", color: "red" }
  if (bmi < 40) return { labelKey: "prescriptionForm.bmiClassification.obese2", color: "red" }
  return { labelKey: "prescriptionForm.bmiClassification.obese3", color: "red" }
}

interface FormErrors {
  patientName?: string
  patientAge?: string
  medications?: Record<string, Record<string, string>>
}

export function PrescriptionForm({
  initialPatient,
  initialMedications,
  initialNotes,
  onSubmit,
  submitLabel,
}: PrescriptionFormProps) {
  const { t } = useLocale()

  const [patient, setPatient] = useState<Patient>(
    initialPatient ?? { name: "" }
  )
  const [medications, setMedications] = useState<Medication[]>(
    initialMedications ?? [createEmptyMedication()]
  )
  const [notes, setNotes] = useState(initialNotes ?? "")
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  function validate(
    patient: Patient,
    medications: Medication[]
  ): FormErrors {
    const errors: FormErrors = {}

    if (!patient.name.trim()) {
      errors.patientName = t("validation.patientNameRequired")
    } else if (patient.name.trim().length < 2) {
      errors.patientName = t("validation.patientNameMin")
    }

    if (patient.age !== undefined && patient.age !== null) {
      if (patient.age < 0 || patient.age > 150) {
        errors.patientAge = t("validation.ageRange")
      }
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
      const allErrors = validate(patient, medications)
      const visibleErrors: FormErrors = {}

      if (touched.patientName && allErrors.patientName) {
        visibleErrors.patientName = allErrors.patientName
      }
      if (touched.patientAge && allErrors.patientAge) {
        visibleErrors.patientAge = allErrors.patientAge
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
  }, [patient, medications, touched])

  const handleBlur = (key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  const touchAll = () => {
    const allTouched: Record<string, boolean> = {
      patientName: true,
      patientAge: true,
    }
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

    const allErrors = validate(patient, medications)
    if (
      allErrors.patientName ||
      allErrors.patientAge ||
      (allErrors.medications && Object.keys(allErrors.medications).length > 0)
    ) {
      setErrors(allErrors)
      toaster.error({ title: t("prescriptionForm.fixErrors") })
      return
    }

    onSubmit({
      patient,
      medications: medications.filter((m) => m.name.trim() !== ""),
      notes: notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <VStack gap="6" align="stretch">
        {/* Patient Data */}
        <Box>
          <Heading size="md" mb="4">
            {t("prescriptionForm.patient")}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <Field.Root required invalid={!!errors.patientName}>
              <Field.Label>{t("common.name")}</Field.Label>
              <Input
                placeholder={t("prescriptionForm.patientName")}
                value={patient.name}
                onChange={(e) =>
                  setPatient((p) => ({ ...p, name: e.target.value }))
                }
                onBlur={() => handleBlur("patientName")}
              />
              {errors.patientName && (
                <Field.ErrorText>{errors.patientName}</Field.ErrorText>
              )}
            </Field.Root>
            <Field.Root invalid={!!errors.patientAge}>
              <Field.Label>{t("prescriptionForm.age")}</Field.Label>
              <Input
                type="number"
                placeholder={t("prescriptionForm.age")}
                value={patient.age ?? ""}
                onChange={(e) =>
                  setPatient((p) => ({
                    ...p,
                    age: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                onBlur={() => handleBlur("patientAge")}
              />
              {errors.patientAge && (
                <Field.ErrorText>{errors.patientAge}</Field.ErrorText>
              )}
            </Field.Root>
            <Field.Root>
              <Field.Label>{t("prescriptionForm.weight")}</Field.Label>
              <MeasurementInput
                value={patient.weight}
                unit={patient.weightUnit ?? "kg"}
                onValueChange={(v) =>
                  setPatient((p) => ({ ...p, weight: v }))
                }
                onUnitChange={(u) =>
                  setPatient((p) => ({ ...p, weightUnit: u as WeightUnit }))
                }
                units={[
                  { value: "kg", label: "kg" },
                  { value: "lb", label: "lb" },
                ]}
                placeholder={t("prescriptionForm.weightPlaceholder")}
                min={0}
                step={0.1}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>{t("prescriptionForm.height")}</Field.Label>
              <MeasurementInput
                value={patient.height}
                unit={patient.heightUnit ?? "cm"}
                onValueChange={(v) =>
                  setPatient((p) => ({ ...p, height: v }))
                }
                onUnitChange={(u) =>
                  setPatient((p) => ({ ...p, heightUnit: u as HeightUnit }))
                }
                units={[
                  { value: "cm", label: "cm" },
                  { value: "m", label: "m" },
                ]}
                placeholder={t("prescriptionForm.heightPlaceholder")}
                min={0}
                step={0.01}
              />
            </Field.Root>
          </SimpleGrid>

          {/* BMI Display */}
          {(() => {
            const bmi = calculateBMI(patient)
            if (bmi === null) return null
            const cls = classifyBMI(bmi)
            return (
              <Flex align="center" gap="3" mt="4" p="3" borderWidth="1px" borderRadius="md" bg="bg.subtle">
                <Text fontSize="sm" fontWeight="medium">
                  {t("prescriptionForm.bmi")}: <strong>{bmi.toFixed(1)}</strong>
                </Text>
                <Badge
                  colorPalette={cls.color}
                  variant="subtle"
                  fontSize="xs"
                >
                  {t(cls.labelKey)}
                </Badge>
              </Flex>
            )
          })()}
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
          <Field.Label>{t("prescriptionForm.generalObs")}</Field.Label>
          <Textarea
            placeholder={t("prescriptionForm.generalObsPlaceholder")}
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
