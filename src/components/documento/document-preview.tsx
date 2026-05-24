"use client"

import { forwardRef } from "react"
import { Box, Text, Flex, VStack, Separator, Image } from "@chakra-ui/react"
import type { Prescription, DoctorConfig, Institution, Patient } from "@/types"
import { useLocale } from "@/hooks/use-locale"

function calcBMI(p: Patient): number | null {
  if (!p.weight || !p.height) return null
  let kg = p.weight
  if (p.weightUnit === "lb") kg = p.weight * 0.453592
  let m = p.height
  if ((p.heightUnit ?? "cm") === "cm") m = p.height / 100
  if (m <= 0 || kg <= 0) return null
  return kg / (m * m)
}

interface DocumentPreviewProps {
  prescription: Prescription
  config: DoctorConfig
  institution?: Institution
  type: "prescricao" | "atestado" | "declaracao"
  daysOff?: number
  includeCID?: boolean
  cid?: string
}

export const DocumentPreview = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  function DocumentPreview(
    { prescription, config, institution, type, daysOff = 1, includeCID, cid },
    ref
  ) {
    const { t, locale } = useLocale()

    const currentDate = new Date().toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const capitalizedDate =
      currentDate.charAt(0).toUpperCase() + currentDate.slice(1)

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
        {/* Institution header */}
        {institution && (
          <VStack gap="1" mb="6" textAlign="center">
            {institution.logo && (
              <Image
                src={institution.logo}
                alt={institution.name}
                maxH="80px"
                maxW="280px"
                objectFit="contain"
                mb="2"
              />
            )}
            <Text fontSize="14pt" fontWeight="bold" textTransform="uppercase">
              {institution.name}
            </Text>
            {institution.address && (
              <Text fontSize="9pt" color="gray.600">
                {institution.address}
              </Text>
            )}
            {institution.phone && (
              <Text fontSize="9pt" color="gray.600">
                {t("document.tel")} {institution.phone}
              </Text>
            )}
          </VStack>
        )}

        <Separator mb="6" borderColor="black" />

        {type === "prescricao" ? (
          /* ---- PRESCRIPTION ---- */
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

            <Text mb="2">
              <strong>{t("document.patient")}</strong> {prescription.patient.name}
            </Text>

            <Flex gap="6" mb="4" flexWrap="wrap">
              {prescription.patient.age != null && (
                <Text>
                  <strong>{t("document.patientAge")}</strong> {prescription.patient.age} {t("common.years")}
                </Text>
              )}
              {prescription.patient.weight != null && (
                <Text>
                  <strong>{t("document.patientWeight")}</strong>{" "}
                  {prescription.patient.weight} {prescription.patient.weightUnit ?? "kg"}
                </Text>
              )}
              {prescription.patient.height != null && (
                <Text>
                  <strong>{t("document.patientHeight")}</strong>{" "}
                  {prescription.patient.height} {prescription.patient.heightUnit ?? "cm"}
                </Text>
              )}
              {(() => {
                const bmi = calcBMI(prescription.patient)
                if (!bmi) return null
                return (
                  <Text>
                    <strong>{t("document.patientBMI")}</strong> {bmi.toFixed(1)}
                  </Text>
                )
              })()}
            </Flex>

            <Separator my="4" borderColor="gray.400" />

            <VStack gap="4" align="stretch" mt="4">
              {prescription.medications.map((med, index) => (
                <Box key={med.id}>
                  <Text fontWeight="bold">
                    {index + 1}) {med.name} — {med.dosage}
                  </Text>
                  <Text ml="4">
                    {t("document.via")} {med.route}, {med.frequency}
                    {med.duration ? `, ${t("document.por")} ${med.duration}` : ""}
                  </Text>
                  {med.notes && (
                    <Text ml="4" fontStyle="italic" color="gray.600">
                      {med.notes}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>

            {prescription.notes && (
              <Box mt="6">
                <Text fontWeight="bold">{t("document.observationsLabel")}</Text>
                <Text>{prescription.notes}</Text>
              </Box>
            )}
          </Box>
        ) : type === "atestado" ? (
          /* ---- CERTIFICATE ---- */
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
                name: prescription.patient.name,
                days: daysOff,
                daysWritten: daysOff === 1 ? t("document.daysWrittenOne") : String(daysOff),
                plural: daysOff > 1 ? "s" : "",
              })}
            </Text>

            {includeCID && cid && (
              <Text mt="4">
                <strong>{t("document.cidLabel")}</strong> {cid}
              </Text>
            )}
          </Box>
        ) : (
          /* ---- DECLARATION ---- */
          <Box>
            <Text
              fontSize="14pt"
              fontWeight="bold"
              textAlign="center"
              mb="8"
              textDecoration="underline"
            >
              {t("document.declaracaoAtendimento")}
            </Text>

            <Text textAlign="justify" lineHeight="2">
              {institution
                ? t("document.declaracaoText", {
                    name: prescription.patient.name,
                    institution: institution.name,
                    doctor: config.name || t("document.doctorNameDefault"),
                  })
                : t("document.declaracaoTextNoInst", {
                    name: prescription.patient.name,
                    doctor: config.name || t("document.doctorNameDefault"),
                  })}
            </Text>

            <Text textAlign="justify" lineHeight="2" mt="4">
              {t("document.declaracaoPurpose")}
            </Text>
          </Box>
        )}

        {/* Footer with date and signature */}
        <Box position="absolute" bottom="80px" left="48px" right="48px">
          <Text mb="12" color="gray.600">
            {capitalizedDate}
          </Text>

          <VStack gap="1" align="flex-end">
            <Separator w="250px" borderColor="black" />
            <Text fontWeight="bold" textTransform="uppercase">
              {config.name || t("document.doctorNameDefault")}
            </Text>
            <Text fontSize="9pt">
              {t("document.doctorLabel")}{config.specialty ? ` - ${config.specialty}` : ""}
              {config.crm ? ` - CRM: ${config.crm}` : ""}
            </Text>
          </VStack>
        </Box>
      </Box>
    )
  }
)
