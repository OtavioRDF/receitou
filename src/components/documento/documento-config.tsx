"use client"

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  VStack,
  Text,
  Image,
  Separator,
} from "@chakra-ui/react"
import { Field } from "@chakra-ui/react"
import { LuPrinter, LuFileText } from "react-icons/lu"
import { buscarCID } from "@/data/cid-10"
import { useState, useRef } from "react"
import type { CID, Instituicao } from "@/types"
import { useLocale } from "@/hooks/use-locale"

interface DocumentoConfigProps {
  tipo: "prescricao" | "atestado"
  onTipoChange: (tipo: "prescricao" | "atestado") => void
  diasAfastamento: number
  onDiasChange: (dias: number) => void
  incluirCID: boolean
  onIncluirCIDChange: (incluir: boolean) => void
  cid: string
  onCIDChange: (cid: string) => void
  onImprimir: () => void
  instituicoes: Instituicao[]
  instituicaoId: string | null
  onInstituicaoChange: (id: string | null) => void
}

export function DocumentoConfig({
  tipo,
  onTipoChange,
  diasAfastamento,
  onDiasChange,
  incluirCID,
  onIncluirCIDChange,
  cid,
  onCIDChange,
  onImprimir,
  instituicoes,
  instituicaoId,
  onInstituicaoChange,
}: DocumentoConfigProps) {
  const { t } = useLocale()
  const [cidSearch, setCidSearch] = useState("")
  const [cidResults, setCidResults] = useState<CID[]>([])
  const [showCidResults, setShowCidResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const handleCidSearch = (term: string) => {
    setCidSearch(term)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (term.trim().length < 2) {
      setCidResults([])
      setShowCidResults(false)
      return
    }

    setIsSearching(true)
    debounceRef.current = setTimeout(async () => {
      const results = await buscarCID(term)
      setCidResults(results)
      setShowCidResults(results.length > 0)
      setIsSearching(false)
    }, 300)
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Instituição / Cabeçalho */}
      <Box>
        <Heading size="sm" mb="3">
          {t("document.institutionHeader")}
        </Heading>

        {instituicoes.length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            {t("document.noInstitutions")}
          </Text>
        ) : (
          <VStack gap="2" align="stretch">
            {/* Opção sem instituição */}
            <Box
              px="3"
              py="2"
              borderWidth="1px"
              borderRadius="md"
              cursor="pointer"
              bg={instituicaoId === null ? "blue.50" : "transparent"}
              borderColor={instituicaoId === null ? "blue.400" : "border"}
              _hover={{ bg: instituicaoId === null ? "blue.50" : "bg.muted" }}
              onClick={() => onInstituicaoChange(null)}
            >
              <Text fontSize="sm" color={instituicaoId === null ? "blue.700" : "fg.muted"}>
                {t("document.noHeader")}
              </Text>
            </Box>

            {instituicoes.map((inst) => (
              <Flex
                key={inst.id}
                align="center"
                gap="3"
                px="3"
                py="2"
                borderWidth="1px"
                borderRadius="md"
                cursor="pointer"
                bg={instituicaoId === inst.id ? "blue.50" : "transparent"}
                borderColor={instituicaoId === inst.id ? "blue.400" : "border"}
                _hover={{ bg: instituicaoId === inst.id ? "blue.50" : "bg.muted" }}
                onClick={() => onInstituicaoChange(inst.id)}
              >
                {inst.logo && (
                  <Image
                    src={inst.logo}
                    alt={inst.nome}
                    maxH="30px"
                    maxW="60px"
                    objectFit="contain"
                    flexShrink={0}
                  />
                )}
                <Text
                  fontSize="sm"
                  fontWeight={instituicaoId === inst.id ? "semibold" : "normal"}
                  color={instituicaoId === inst.id ? "blue.700" : "fg"}
                  truncate
                >
                  {inst.nome}
                </Text>
              </Flex>
            ))}
          </VStack>
        )}
      </Box>

      <Separator />

      {/* Tipo de Documento */}
      <Box>
        <Heading size="sm" mb="3">
          {t("document.docType")}
        </Heading>
        <Flex gap="2">
          <Button
            flex="1"
            variant={tipo === "prescricao" ? "solid" : "outline"}
            colorPalette={tipo === "prescricao" ? "blue" : "gray"}
            onClick={() => onTipoChange("prescricao")}
            size="sm"
          >
            <LuFileText />
            {t("document.prescription")}
          </Button>
          <Button
            flex="1"
            variant={tipo === "atestado" ? "solid" : "outline"}
            colorPalette={tipo === "atestado" ? "blue" : "gray"}
            onClick={() => onTipoChange("atestado")}
            size="sm"
          >
            <LuFileText />
            {t("document.certificate")}
          </Button>
        </Flex>
      </Box>

      {tipo === "atestado" && (
        <>
          <Field.Root>
            <Field.Label>{t("document.daysOff")}</Field.Label>
            <Input
              type="number"
              min={1}
              value={diasAfastamento}
              onChange={(e) => onDiasChange(Number(e.target.value) || 1)}
            />
            <Field.HelperText>
              {t("document.daysOffHelper")}
            </Field.HelperText>
          </Field.Root>

          <Flex align="center" gap="2">
            <input
              type="checkbox"
              id="incluir-cid"
              checked={incluirCID}
              onChange={(e) => onIncluirCIDChange(e.target.checked)}
            />
            <label htmlFor="incluir-cid">{t("document.includeCID")}</label>
          </Flex>

          {incluirCID && (
            <Box position="relative">
              <Field.Root>
                <Field.Label>{t("document.cid")}</Field.Label>
                <Input
                  placeholder={t("document.cidPlaceholder")}
                  value={cidSearch || cid}
                  onChange={(e) => {
                    handleCidSearch(e.target.value)
                    if (!e.target.value) onCIDChange("")
                  }}
                  onFocus={() => cidResults.length > 0 && setShowCidResults(true)}
                />
              </Field.Root>

              {showCidResults && (
                <Box
                  position="absolute"
                  top="100%"
                  left="0"
                  right="0"
                  mt="1"
                  bg="bg"
                  borderWidth="1px"
                  borderRadius="md"
                  shadow="lg"
                  zIndex="dropdown"
                  maxH="200px"
                  overflowY="auto"
                >
                  {cidResults.map((c) => (
                    <Box
                      key={c.codigo}
                      px="3"
                      py="2"
                      cursor="pointer"
                      _hover={{ bg: "bg.muted" }}
                      fontSize="sm"
                      onClick={() => {
                        onCIDChange(`${c.codigo} - ${c.descricao}`)
                        setCidSearch("")
                        setShowCidResults(false)
                      }}
                    >
                      <strong>{c.codigo}</strong> — {c.descricao}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </>
      )}

      <Flex gap="3" mt="4">
        <Button colorPalette="blue" onClick={onImprimir} flex="1">
          <LuPrinter />
          {t("document.print")}
        </Button>
      </Flex>
    </VStack>
  )
}
