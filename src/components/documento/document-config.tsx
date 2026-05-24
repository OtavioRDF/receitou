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
import { searchCID } from "@/data/cid-10"
import { useState, useRef } from "react"
import type { CID, Institution } from "@/types"
import { useLocale } from "@/hooks/use-locale"

interface DocumentConfigProps {
  type: "prescricao" | "atestado" | "declaracao"
  onTypeChange: (type: "prescricao" | "atestado" | "declaracao") => void
  daysOff: number
  onDaysChange: (days: number) => void
  includeCID: boolean
  onIncludeCIDChange: (include: boolean) => void
  cid: string
  onCIDChange: (cid: string) => void
  onPrint: () => void
  institutions: Institution[]
  institutionId: string | null
  onInstitutionChange: (id: string | null) => void
}

export function DocumentConfig({
  type,
  onTypeChange,
  daysOff,
  onDaysChange,
  includeCID,
  onIncludeCIDChange,
  cid,
  onCIDChange,
  onPrint,
  institutions,
  institutionId,
  onInstitutionChange,
}: DocumentConfigProps) {
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
      const results = await searchCID(term)
      setCidResults(results)
      setShowCidResults(results.length > 0)
      setIsSearching(false)
    }, 300)
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Institution / Header */}
      <Box>
        <Heading size="sm" mb="3">
          {t("document.institutionHeader")}
        </Heading>

        {institutions.length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            {t("document.noInstitutions")}
          </Text>
        ) : (
          <VStack gap="2" align="stretch">
            <Box
              px="3"
              py="2"
              borderWidth="1px"
              borderRadius="md"
              cursor="pointer"
              bg={institutionId === null ? "blue.50" : "transparent"}
              borderColor={institutionId === null ? "blue.400" : "border"}
              _hover={{ bg: institutionId === null ? "blue.50" : "bg.muted" }}
              onClick={() => onInstitutionChange(null)}
            >
              <Text fontSize="sm" color={institutionId === null ? "blue.700" : "fg.muted"}>
                {t("document.noHeader")}
              </Text>
            </Box>

            {institutions.map((inst) => (
              <Flex
                key={inst.id}
                align="center"
                gap="3"
                px="3"
                py="2"
                borderWidth="1px"
                borderRadius="md"
                cursor="pointer"
                bg={institutionId === inst.id ? "blue.50" : "transparent"}
                borderColor={institutionId === inst.id ? "blue.400" : "border"}
                _hover={{ bg: institutionId === inst.id ? "blue.50" : "bg.muted" }}
                onClick={() => onInstitutionChange(inst.id)}
              >
                {inst.logo && (
                  <Image
                    src={inst.logo}
                    alt={inst.name}
                    maxH="30px"
                    maxW="60px"
                    objectFit="contain"
                    flexShrink={0}
                  />
                )}
                <Text
                  fontSize="sm"
                  fontWeight={institutionId === inst.id ? "semibold" : "normal"}
                  color={institutionId === inst.id ? "blue.700" : "fg"}
                  truncate
                >
                  {inst.name}
                </Text>
              </Flex>
            ))}
          </VStack>
        )}
      </Box>

      <Separator />

      {/* Document Type */}
      <Box>
        <Heading size="sm" mb="3">
          {t("document.docType")}
        </Heading>
        <Flex gap="2" flexWrap="wrap">
          <Button
            flex="1"
            variant={type === "prescricao" ? "solid" : "outline"}
            colorPalette={type === "prescricao" ? "blue" : "gray"}
            onClick={() => onTypeChange("prescricao")}
            size="sm"
          >
            <LuFileText />
            {t("document.prescription")}
          </Button>
          <Button
            flex="1"
            variant={type === "atestado" ? "solid" : "outline"}
            colorPalette={type === "atestado" ? "blue" : "gray"}
            onClick={() => onTypeChange("atestado")}
            size="sm"
          >
            <LuFileText />
            {t("document.certificate")}
          </Button>
          <Button
            flex="1"
            variant={type === "declaracao" ? "solid" : "outline"}
            colorPalette={type === "declaracao" ? "blue" : "gray"}
            onClick={() => onTypeChange("declaracao")}
            size="sm"
          >
            <LuFileText />
            {t("document.declaration")}
          </Button>
        </Flex>
      </Box>

      {type === "atestado" && (
        <>
          <Field.Root>
            <Field.Label>{t("document.daysOff")}</Field.Label>
            <Input
              type="number"
              min={1}
              value={daysOff}
              onChange={(e) => onDaysChange(Number(e.target.value) || 1)}
            />
            <Field.HelperText>
              {t("document.daysOffHelper")}
            </Field.HelperText>
          </Field.Root>

          <Flex align="center" gap="2">
            <input
              type="checkbox"
              id="include-cid"
              checked={includeCID}
              onChange={(e) => onIncludeCIDChange(e.target.checked)}
            />
            <label htmlFor="include-cid">{t("document.includeCID")}</label>
          </Flex>

          {includeCID && (
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
                      key={c.code}
                      px="3"
                      py="2"
                      cursor="pointer"
                      _hover={{ bg: "bg.muted" }}
                      fontSize="sm"
                      onClick={() => {
                        onCIDChange(`${c.code} - ${c.description}`)
                        setCidSearch("")
                        setShowCidResults(false)
                      }}
                    >
                      <strong>{c.code}</strong> — {c.description}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </>
      )}

      <Flex gap="3" mt="4">
        <Button colorPalette="blue" onClick={onPrint} flex="1">
          <LuPrinter />
          {t("document.print")}
        </Button>
      </Flex>
    </VStack>
  )
}
