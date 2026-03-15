"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
  Textarea,
  VStack,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react"
import { LuPlus, LuTrash2 } from "react-icons/lu"
import type { Medicamento, Paciente, WeightUnit, HeightUnit } from "@/types"
import type { TranslationKey } from "@/locales"
import { Field } from "@chakra-ui/react"
import { toaster } from "@/components/ui/toaster"
import { useLocale } from "@/hooks/use-locale"
import { MeasurementInput } from "@/components/ui/measurement-input"

interface PrescricaoFormProps {
  initialPaciente?: Paciente
  initialMedicamentos?: Medicamento[]
  initialObservacoes?: string
  onSubmit: (data: {
    paciente: Paciente
    medicamentos: Medicamento[]
    observacoes?: string
  }) => void
  submitLabel?: string
}

function criarMedicamentoVazio(): Medicamento {
  return {
    id: crypto.randomUUID(),
    nome: "",
    dosagem: "",
    via: "Oral",
    frequencia: "",
    duracao: "",
    observacoes: "",
  }
}

function calcularIMC(paciente: Paciente): number | null {
  if (!paciente.peso || !paciente.altura) return null

  let pesoKg = paciente.peso
  if (paciente.pesoUnidade === "lb") pesoKg = paciente.peso * 0.453592

  let alturaM = paciente.altura
  if ((paciente.alturaUnidade ?? "cm") === "cm") alturaM = paciente.altura / 100

  if (alturaM <= 0 || pesoKg <= 0) return null
  return pesoKg / (alturaM * alturaM)
}

function classificarIMC(bmi: number): { labelKey: TranslationKey; color: string } {
  if (bmi < 18.5) return { labelKey: "prescriptionForm.bmiClassification.underweight", color: "yellow" }
  if (bmi < 25) return { labelKey: "prescriptionForm.bmiClassification.normal", color: "green" }
  if (bmi < 30) return { labelKey: "prescriptionForm.bmiClassification.overweight", color: "orange" }
  if (bmi < 35) return { labelKey: "prescriptionForm.bmiClassification.obese1", color: "red" }
  if (bmi < 40) return { labelKey: "prescriptionForm.bmiClassification.obese2", color: "red" }
  return { labelKey: "prescriptionForm.bmiClassification.obese3", color: "red" }
}

export { calcularIMC }

interface FormErrors {
  pacienteNome?: string
  pacienteIdade?: string
  medicamentos?: Record<string, Record<string, string>>
}

export function PrescricaoForm({
  initialPaciente,
  initialMedicamentos,
  initialObservacoes,
  onSubmit,
  submitLabel,
}: PrescricaoFormProps) {
  const { t } = useLocale()

  const [paciente, setPaciente] = useState<Paciente>(
    initialPaciente ?? { nome: "" }
  )
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>(
    initialMedicamentos ?? [criarMedicamentoVazio()]
  )
  const [observacoes, setObservacoes] = useState(initialObservacoes ?? "")
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  function validate(
    paciente: Paciente,
    medicamentos: Medicamento[]
  ): FormErrors {
    const errors: FormErrors = {}

    if (!paciente.nome.trim()) {
      errors.pacienteNome = t("validation.patientNameRequired")
    } else if (paciente.nome.trim().length < 2) {
      errors.pacienteNome = t("validation.patientNameMin")
    }

    if (paciente.idade !== undefined && paciente.idade !== null) {
      if (paciente.idade < 0 || paciente.idade > 150) {
        errors.pacienteIdade = t("validation.ageRange")
      }
    }

    const medErrors: Record<string, Record<string, string>> = {}
    const medsPreenchidos = medicamentos.filter(
      (m) => m.nome.trim() || m.dosagem.trim() || m.frequencia.trim()
    )

    medsPreenchidos.forEach((med) => {
      const errs: Record<string, string> = {}
      if (!med.nome.trim()) errs.nome = t("validation.medNameRequired")
      if (!med.dosagem.trim()) errs.dosagem = t("validation.medDosageRequired")
      if (!med.frequencia.trim()) errs.frequencia = t("validation.medFrequencyRequired")
      if (Object.keys(errs).length > 0) medErrors[med.id] = errs
    })

    if (Object.keys(medErrors).length > 0) errors.medicamentos = medErrors

    return errors
  }

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const allErrors = validate(paciente, medicamentos)
      const visibleErrors: FormErrors = {}

      if (touched.pacienteNome && allErrors.pacienteNome) {
        visibleErrors.pacienteNome = allErrors.pacienteNome
      }
      if (touched.pacienteIdade && allErrors.pacienteIdade) {
        visibleErrors.pacienteIdade = allErrors.pacienteIdade
      }
      if (allErrors.medicamentos) {
        const visibleMedErrors: Record<string, Record<string, string>> = {}
        for (const [medId, medErrs] of Object.entries(allErrors.medicamentos)) {
          const visible: Record<string, string> = {}
          for (const [field, msg] of Object.entries(medErrs)) {
            if (touched[`med_${medId}_${field}`]) visible[field] = msg
          }
          if (Object.keys(visible).length > 0) visibleMedErrors[medId] = visible
        }
        if (Object.keys(visibleMedErrors).length > 0) {
          visibleErrors.medicamentos = visibleMedErrors
        }
      }

      setErrors(visibleErrors)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paciente, medicamentos, touched])

  const handleBlur = (key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  const touchAll = () => {
    const allTouched: Record<string, boolean> = {
      pacienteNome: true,
      pacienteIdade: true,
    }
    medicamentos.forEach((med) => {
      allTouched[`med_${med.id}_nome`] = true
      allTouched[`med_${med.id}_dosagem`] = true
      allTouched[`med_${med.id}_frequencia`] = true
    })
    setTouched(allTouched)
  }

  const adicionarMedicamento = () => {
    setMedicamentos((prev) => [...prev, criarMedicamentoVazio()])
  }

  const removerMedicamento = (id: string) => {
    setMedicamentos((prev) => prev.filter((m) => m.id !== id))
  }

  const atualizarMedicamento = (
    id: string,
    field: keyof Medicamento,
    value: string
  ) => {
    setMedicamentos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  const getMedError = (medId: string, field: string) =>
    errors.medicamentos?.[medId]?.[field]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    touchAll()

    const allErrors = validate(paciente, medicamentos)
    if (
      allErrors.pacienteNome ||
      allErrors.pacienteIdade ||
      (allErrors.medicamentos && Object.keys(allErrors.medicamentos).length > 0)
    ) {
      setErrors(allErrors)
      toaster.error({ title: t("prescriptionForm.fixErrors") })
      return
    }

    onSubmit({
      paciente,
      medicamentos: medicamentos.filter((m) => m.nome.trim() !== ""),
      observacoes: observacoes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <VStack gap="6" align="stretch">
        {/* Dados do Paciente */}
        <Box>
          <Heading size="md" mb="4">
            {t("prescriptionForm.patient")}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <Field.Root required invalid={!!errors.pacienteNome}>
              <Field.Label>{t("common.name")}</Field.Label>
              <Input
                placeholder={t("prescriptionForm.patientName")}
                value={paciente.nome}
                onChange={(e) =>
                  setPaciente((p) => ({ ...p, nome: e.target.value }))
                }
                onBlur={() => handleBlur("pacienteNome")}
              />
              {errors.pacienteNome && (
                <Field.ErrorText>{errors.pacienteNome}</Field.ErrorText>
              )}
            </Field.Root>
            <Field.Root invalid={!!errors.pacienteIdade}>
              <Field.Label>{t("prescriptionForm.age")}</Field.Label>
              <Input
                type="number"
                placeholder={t("prescriptionForm.age")}
                value={paciente.idade ?? ""}
                onChange={(e) =>
                  setPaciente((p) => ({
                    ...p,
                    idade: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                onBlur={() => handleBlur("pacienteIdade")}
              />
              {errors.pacienteIdade && (
                <Field.ErrorText>{errors.pacienteIdade}</Field.ErrorText>
              )}
            </Field.Root>
            <Field.Root>
              <Field.Label>{t("prescriptionForm.weight")}</Field.Label>
              <MeasurementInput
                value={paciente.peso}
                unit={paciente.pesoUnidade ?? "kg"}
                onValueChange={(v) =>
                  setPaciente((p) => ({ ...p, peso: v }))
                }
                onUnitChange={(u) =>
                  setPaciente((p) => ({ ...p, pesoUnidade: u as WeightUnit }))
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
                value={paciente.altura}
                unit={paciente.alturaUnidade ?? "cm"}
                onValueChange={(v) =>
                  setPaciente((p) => ({ ...p, altura: v }))
                }
                onUnitChange={(u) =>
                  setPaciente((p) => ({ ...p, alturaUnidade: u as HeightUnit }))
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

          {/* IMC Display */}
          {(() => {
            const bmi = calcularIMC(paciente)
            if (bmi === null) return null
            const cls = classificarIMC(bmi)
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

        {/* Medicamentos */}
        <Box>
          <Flex justify="space-between" align="center" mb="4">
            <Heading size="md">{t("medications.title")}</Heading>
            <Button size="sm" variant="outline" onClick={adicionarMedicamento}>
              <LuPlus />
              {t("common.add")}
            </Button>
          </Flex>

          <VStack gap="4" align="stretch">
            {medicamentos.map((med, index) => (
              <Box
                key={med.id}
                p="4"
                borderWidth="1px"
                borderRadius="md"
                borderColor={
                  errors.medicamentos?.[med.id] ? "red.500" : undefined
                }
              >
                <Flex justify="space-between" align="center" mb="3">
                  <Text fontWeight="medium" fontSize="sm" color="fg.muted">
                    {t("medications.medication")} {index + 1}
                  </Text>
                  {medicamentos.length > 1 && (
                    <IconButton
                      aria-label={t("medications.remove")}
                      variant="ghost"
                      size="xs"
                      colorPalette="red"
                      onClick={() => removerMedicamento(med.id)}
                    >
                      <LuTrash2 />
                    </IconButton>
                  )}
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                  <Field.Root required invalid={!!getMedError(med.id, "nome")}>
                    <Field.Label>{t("medications.name")}</Field.Label>
                    <Input
                      placeholder={t("medications.namePlaceholder")}
                      value={med.nome}
                      onChange={(e) =>
                        atualizarMedicamento(med.id, "nome", e.target.value)
                      }
                      onBlur={() => handleBlur(`med_${med.id}_nome`)}
                    />
                    {getMedError(med.id, "nome") && (
                      <Field.ErrorText>
                        {getMedError(med.id, "nome")}
                      </Field.ErrorText>
                    )}
                  </Field.Root>
                  <Field.Root required invalid={!!getMedError(med.id, "dosagem")}>
                    <Field.Label>{t("medications.dosage")}</Field.Label>
                    <Input
                      placeholder={t("medications.dosagePlaceholder")}
                      value={med.dosagem}
                      onChange={(e) =>
                        atualizarMedicamento(med.id, "dosagem", e.target.value)
                      }
                      onBlur={() => handleBlur(`med_${med.id}_dosagem`)}
                    />
                    {getMedError(med.id, "dosagem") && (
                      <Field.ErrorText>
                        {getMedError(med.id, "dosagem")}
                      </Field.ErrorText>
                    )}
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t("medications.route")}</Field.Label>
                    <Input
                      placeholder={t("medications.routePlaceholder")}
                      value={med.via}
                      onChange={(e) =>
                        atualizarMedicamento(med.id, "via", e.target.value)
                      }
                    />
                  </Field.Root>
                  <Field.Root required invalid={!!getMedError(med.id, "frequencia")}>
                    <Field.Label>{t("medications.frequency")}</Field.Label>
                    <Input
                      placeholder={t("medications.frequencyPlaceholder")}
                      value={med.frequencia}
                      onChange={(e) =>
                        atualizarMedicamento(med.id, "frequencia", e.target.value)
                      }
                      onBlur={() => handleBlur(`med_${med.id}_frequencia`)}
                    />
                    {getMedError(med.id, "frequencia") && (
                      <Field.ErrorText>
                        {getMedError(med.id, "frequencia")}
                      </Field.ErrorText>
                    )}
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t("medications.duration")}</Field.Label>
                    <Input
                      placeholder={t("medications.durationPlaceholder")}
                      value={med.duracao ?? ""}
                      onChange={(e) =>
                        atualizarMedicamento(med.id, "duracao", e.target.value)
                      }
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t("medications.observations")}</Field.Label>
                    <Input
                      placeholder={t("medications.observationsPlaceholder")}
                      value={med.observacoes ?? ""}
                      onChange={(e) =>
                        atualizarMedicamento(med.id, "observacoes", e.target.value)
                      }
                    />
                  </Field.Root>
                </SimpleGrid>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Observações Gerais */}
        <Field.Root>
          <Field.Label>{t("prescriptionForm.generalObs")}</Field.Label>
          <Textarea
            placeholder={t("prescriptionForm.generalObsPlaceholder")}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
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
