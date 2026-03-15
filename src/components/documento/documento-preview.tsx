"use client"

import { forwardRef } from "react"
import { Box, Text, Flex, VStack, Separator, Image } from "@chakra-ui/react"
import type { Prescricao, ConfigMedico, Instituicao, Paciente } from "@/types"
import { useLocale } from "@/hooks/use-locale"

function calcIMC(p: Paciente): number | null {
  if (!p.peso || !p.altura) return null
  let kg = p.peso
  if (p.pesoUnidade === "lb") kg = p.peso * 0.453592
  let m = p.altura
  if ((p.alturaUnidade ?? "cm") === "cm") m = p.altura / 100
  if (m <= 0 || kg <= 0) return null
  return kg / (m * m)
}

interface DocumentoPreviewProps {
  prescricao: Prescricao
  config: ConfigMedico
  instituicao?: Instituicao
  tipo: "prescricao" | "atestado"
  diasAfastamento?: number
  incluirCID?: boolean
  cid?: string
}

export const DocumentoPreview = forwardRef<HTMLDivElement, DocumentoPreviewProps>(
  function DocumentoPreview(
    { prescricao, config, instituicao, tipo, diasAfastamento = 1, incluirCID, cid },
    ref
  ) {
    const { t, locale } = useLocale()

    const dataAtual = new Date().toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const dataCapitalizada =
      dataAtual.charAt(0).toUpperCase() + dataAtual.slice(1)

    return (
      <Box
        ref={ref}
        bg="white"
        color="black"
        p="12"
        minH="842px"
        w="595px"
        mx="auto"
        shadow="lg"
        fontFamily="serif"
        fontSize="11pt"
        lineHeight="1.6"
        position="relative"
      >
        {/* Cabeçalho com logo e dados da instituição */}
        {instituicao && (
          <VStack gap="1" mb="6" textAlign="center">
            {instituicao.logo && (
              <Image
                src={instituicao.logo}
                alt={instituicao.nome}
                maxH="80px"
                maxW="280px"
                objectFit="contain"
                mb="2"
              />
            )}
            <Text fontSize="14pt" fontWeight="bold" textTransform="uppercase">
              {instituicao.nome}
            </Text>
            {instituicao.endereco && (
              <Text fontSize="9pt" color="gray.600">
                {instituicao.endereco}
              </Text>
            )}
            {instituicao.telefone && (
              <Text fontSize="9pt" color="gray.600">
                {t("document.tel")} {instituicao.telefone}
              </Text>
            )}
          </VStack>
        )}

        <Separator mb="6" borderColor="black" />

        {tipo === "prescricao" ? (
          /* ---- PRESCRIÇÃO ---- */
          <Box>
            <Text
              fontSize="14pt"
              fontWeight="bold"
              textAlign="center"
              mb="6"
              textDecoration="underline"
            >
              {t("document.receituario")}
            </Text>

            <Flex justify="space-between" mb="4">
              <Text>
                <strong>{t("document.patient")}</strong> {prescricao.paciente.nome}
              </Text>
              {prescricao.paciente.idade && (
                <Text>
                  <strong>{t("document.patientAge")}</strong> {prescricao.paciente.idade} {t("common.years")}
                </Text>
              )}
            </Flex>

            {(prescricao.paciente.peso || prescricao.paciente.altura) && (
              <Flex gap="6" mb="4" flexWrap="wrap">
                {prescricao.paciente.peso && (
                  <Text>
                    <strong>{t("document.patientWeight")}</strong>{" "}
                    {prescricao.paciente.peso}{prescricao.paciente.pesoUnidade ?? "kg"}
                  </Text>
                )}
                {prescricao.paciente.altura && (
                  <Text>
                    <strong>{t("document.patientHeight")}</strong>{" "}
                    {prescricao.paciente.altura}{prescricao.paciente.alturaUnidade ?? "cm"}
                  </Text>
                )}
                {(() => {
                  const bmi = calcIMC(prescricao.paciente)
                  if (!bmi) return null
                  return (
                    <Text>
                      <strong>{t("document.patientBMI")}</strong> {bmi.toFixed(1)}
                    </Text>
                  )
                })()}
              </Flex>
            )}

            <Separator my="4" borderColor="gray.400" />

            <VStack gap="4" align="stretch" mt="4">
              {prescricao.medicamentos.map((med, index) => (
                <Box key={med.id}>
                  <Text fontWeight="bold">
                    {index + 1}) {med.nome} — {med.dosagem}
                  </Text>
                  <Text ml="4">
                    {t("document.via")} {med.via}, {med.frequencia}
                    {med.duracao ? `, ${t("document.por")} ${med.duracao}` : ""}
                  </Text>
                  {med.observacoes && (
                    <Text ml="4" fontStyle="italic" color="gray.600">
                      {med.observacoes}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>

            {prescricao.observacoes && (
              <Box mt="6">
                <Text fontWeight="bold">{t("document.observationsLabel")}</Text>
                <Text>{prescricao.observacoes}</Text>
              </Box>
            )}
          </Box>
        ) : (
          /* ---- ATESTADO ---- */
          <Box>
            <Text
              fontSize="14pt"
              fontWeight="bold"
              textAlign="center"
              mb="8"
              textDecoration="underline"
            >
              {t("document.atestadoMedico")}
            </Text>

            <Text textAlign="justify" lineHeight="2">
              {t("document.certificateText", {
                name: prescricao.paciente.nome,
                days: diasAfastamento,
                daysWritten: diasAfastamento === 1 ? t("document.daysWrittenOne") : String(diasAfastamento),
                plural: diasAfastamento > 1 ? "s" : "",
              })}
            </Text>

            {incluirCID && cid && (
              <Text mt="4">
                <strong>{t("document.cidLabel")}</strong> {cid}
              </Text>
            )}
          </Box>
        )}

        {/* Rodapé com data e assinatura */}
        <Box position="absolute" bottom="80px" left="48px" right="48px">
          <Text mb="12" color="gray.600">
            {dataCapitalizada}
          </Text>

          <VStack gap="1" align="flex-end">
            <Separator w="250px" borderColor="black" />
            <Text fontWeight="bold" textTransform="uppercase">
              {config.nome || t("document.doctorNameDefault")}
            </Text>
            <Text fontSize="9pt">
              {t("document.doctorLabel")}{config.especialidade ? ` - ${config.especialidade}` : ""}
              {config.crm ? ` - CRM: ${config.crm}` : ""}
            </Text>
          </VStack>
        </Box>
      </Box>
    )
  }
)
