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
} from "@chakra-ui/react"
import { LuPlus, LuTrash2 } from "react-icons/lu"
import type { Medicamento } from "@/types"
import { Field } from "@chakra-ui/react"
import { toaster } from "@/components/ui/toaster"
import { useLocale } from "@/hooks/use-locale"

interface TemplateFormProps {
  initialNome?: string
  initialDescricao?: string
  initialMedicamentos?: Medicamento[]
  initialObservacoes?: string
  onSubmit: (data: {
    nome: string
    descricao?: string
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

interface FormErrors {
  nome?: string
  medicamentos?: Record<string, Record<string, string>>
}

export function TemplateForm({
  initialNome,
  initialDescricao,
  initialMedicamentos,
  initialObservacoes,
  onSubmit,
  submitLabel,
}: TemplateFormProps) {
  const { t } = useLocale()

  const [nome, setNome] = useState(initialNome ?? "")
  const [descricao, setDescricao] = useState(initialDescricao ?? "")
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>(
    initialMedicamentos ?? [criarMedicamentoVazio()]
  )
  const [observacoes, setObservacoes] = useState(initialObservacoes ?? "")
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  function validate(nome: string, medicamentos: Medicamento[]): FormErrors {
    const errors: FormErrors = {}

    if (!nome.trim()) {
      errors.nome = t("validation.templateNameRequired")
    } else if (nome.trim().length < 2) {
      errors.nome = t("validation.templateNameMin")
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
      const allErrors = validate(nome, medicamentos)
      const visibleErrors: FormErrors = {}

      if (touched.nome && allErrors.nome) {
        visibleErrors.nome = allErrors.nome
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
  }, [nome, medicamentos, touched])

  const handleBlur = (key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  const touchAll = () => {
    const allTouched: Record<string, boolean> = { nome: true }
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

    const allErrors = validate(nome, medicamentos)
    if (
      allErrors.nome ||
      (allErrors.medicamentos && Object.keys(allErrors.medicamentos).length > 0)
    ) {
      setErrors(allErrors)
      toaster.error({ title: t("templateForm.fixErrors") })
      return
    }

    onSubmit({
      nome,
      descricao: descricao || undefined,
      medicamentos: medicamentos.filter((m) => m.nome.trim() !== ""),
      observacoes: observacoes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <VStack gap="6" align="stretch">
        {/* Dados do Template */}
        <Box>
          <Heading size="md" mb="4">
            {t("templateForm.info")}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <Field.Root required invalid={!!errors.nome}>
              <Field.Label>{t("templateForm.name")}</Field.Label>
              <Input
                placeholder={t("templateForm.namePlaceholder")}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onBlur={() => handleBlur("nome")}
              />
              {errors.nome && (
                <Field.ErrorText>{errors.nome}</Field.ErrorText>
              )}
            </Field.Root>
            <Field.Root>
              <Field.Label>{t("templateForm.description")}</Field.Label>
              <Input
                placeholder={t("templateForm.descPlaceholder")}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </Field.Root>
          </SimpleGrid>
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
          <Field.Label>{t("templateForm.generalObs")}</Field.Label>
          <Textarea
            placeholder={t("templateForm.generalObsPlaceholder")}
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
