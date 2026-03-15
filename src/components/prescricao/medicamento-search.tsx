"use client"

import { useState, useEffect, useRef } from "react"
import { Box, Input, VStack, Text, Flex, Spinner } from "@chakra-ui/react"
import { buscarMedicamentos } from "@/lib/api"
import type { MedicamentoAPI } from "@/types"

interface MedicamentoSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (medicamento: MedicamentoAPI) => void
  placeholder?: string
}

export function MedicamentoSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Buscar medicamento...",
}: MedicamentoSearchProps) {
  const [resultados, setResultados] = useState<MedicamentoAPI[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (value.trim().length < 3) {
      setResultados([])
      setIsOpen(false)
      return
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      const results = await buscarMedicamentos(value)
      setResultados(results)
      setIsOpen(results.length > 0)
      setIsLoading(false)
    }, 400)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <Box position="relative" ref={containerRef}>
      <Flex align="center" gap="2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => resultados.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
        />
        {isLoading && <Spinner size="sm" />}
      </Flex>

      {isOpen && (
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
          <VStack gap="0" align="stretch">
            {resultados.slice(0, 8).map((med, i) => (
              <Box
                key={`${med.nome}-${i}`}
                px="3"
                py="2"
                cursor="pointer"
                _hover={{ bg: "bg.muted" }}
                onClick={() => {
                  onSelect(med)
                  setIsOpen(false)
                }}
              >
                <Text fontSize="sm" fontWeight="medium">
                  {med.nome}
                </Text>
                {med.laboratorio && (
                  <Text fontSize="xs" color="fg.muted">
                    {med.laboratorio}
                  </Text>
                )}
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  )
}
