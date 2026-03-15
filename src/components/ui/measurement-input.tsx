"use client"

import { Input, Flex, Box, Text } from "@chakra-ui/react"
import { useState, useRef, useEffect } from "react"

interface MeasurementOption {
  value: string
  label: string
}

interface MeasurementInputProps {
  value: number | undefined
  unit: string
  onValueChange: (value: number | undefined) => void
  onUnitChange: (unit: string) => void
  units: MeasurementOption[]
  placeholder?: string
  min?: number
  max?: number
  step?: number
}

export function MeasurementInput({
  value,
  unit,
  onValueChange,
  onUnitChange,
  units,
  placeholder,
  min,
  max,
  step,
}: MeasurementInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const currentUnit = units.find((u) => u.value === unit) ?? units[0]

  return (
    <Box position="relative">
      <Flex
        align="center"
        gap="0"
        borderWidth="1px"
        borderRadius="md"
        overflow="hidden"
      >
        {/* Number input */}
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) =>
            onValueChange(e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          border="none"
          _focus={{ boxShadow: "none" }}
          borderRadius="0"
        />

        {/* Unit selector */}
        <Flex
          ref={triggerRef}
          align="center"
          gap="1"
          px="3"
          py="2"
          bg="bg.muted"
          borderLeftWidth="1px"
          cursor="pointer"
          flexShrink={0}
          _hover={{ bg: "bg.emphasized" }}
          transition="background 0.15s"
          onClick={() => setIsOpen((prev) => !prev)}
          userSelect="none"
          minW="60px"
          justify="center"
        >
          <Text fontSize="sm" fontWeight="medium">
            {currentUnit.label}
          </Text>
          <Text fontSize="xs" color="fg.muted" ml="-0.5">
            ▾
          </Text>
        </Flex>
      </Flex>

      {/* Unit dropdown */}
      {isOpen && (
        <Box
          ref={dropdownRef}
          position="absolute"
          top="100%"
          right="0"
          mt="1"
          w="120px"
          bg="bg"
          borderWidth="1px"
          borderRadius="md"
          shadow="lg"
          zIndex="dropdown"
          overflow="hidden"
        >
          {units.map((u) => (
            <Flex
              key={u.value}
              align="center"
              px="3"
              py="2"
              cursor="pointer"
              _hover={{ bg: "bg.muted" }}
              bg={unit === u.value ? "bg.muted" : "transparent"}
              onClick={() => {
                onUnitChange(u.value)
                setIsOpen(false)
              }}
            >
              <Text
                fontSize="sm"
                fontWeight={unit === u.value ? "semibold" : "normal"}
              >
                {u.label}
              </Text>
            </Flex>
          ))}
        </Box>
      )}
    </Box>
  )
}
