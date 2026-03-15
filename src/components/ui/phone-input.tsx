"use client"

import {
  usePhoneInput,
  defaultCountries,
  parseCountry,
} from "react-international-phone"
import "react-international-phone/style.css"
import { Input, Flex, Box, Text } from "@chakra-ui/react"
import { useState, useRef, useEffect } from "react"
import { useLocale } from "@/hooks/use-locale"

interface PhoneInputProps {
  value: string
  onChange: (phone: string) => void
  defaultCountry?: string
}

function getCountryFlag(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

const countries = defaultCountries.map((c) => parseCountry(c))

export function PhoneInput({
  value,
  onChange,
  defaultCountry = "br",
}: PhoneInputProps) {
  const { t } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [hasMounted, setHasMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const phoneInput = usePhoneInput({
    defaultCountry,
    value,
    onChange: (data) => {
      if (!hasMounted) return
      onChange(data.phone)
    },
  })

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const setCountry = phoneInput.setCountry

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCountries = search
    ? countries.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dialCode.includes(search) ||
          c.iso2.includes(search.toLowerCase())
      )
    : countries

  return (
    <Box position="relative">
      <Flex
        align="center"
        gap="0"
        borderWidth="1px"
        borderRadius="md"
        overflow="hidden"
      >
        {/* Country selector trigger */}
        <Flex
          ref={triggerRef}
          align="center"
          gap="1.5"
          px="3"
          py="2"
          bg="bg.muted"
          borderRightWidth="1px"
          cursor="pointer"
          flexShrink={0}
          _hover={{ bg: "bg.emphasized" }}
          transition="background 0.15s"
          onClick={() => {
            setIsOpen((prev) => !prev)
            setSearch("")
          }}
          userSelect="none"
        >
          <Text fontSize="lg" lineHeight="1">
            {phoneInput.country?.iso2
              ? getCountryFlag(phoneInput.country.iso2)
              : "🌐"}
          </Text>
          <Text fontSize="sm" color="fg.muted" fontWeight="medium">
            +{phoneInput.country?.dialCode}
          </Text>
          <Text fontSize="xs" color="fg.muted" ml="-0.5">
            ▾
          </Text>
        </Flex>

        {/* Phone number input */}
        <Input
          ref={phoneInput.inputRef}
          value={phoneInput.inputValue}
          onChange={phoneInput.handlePhoneValueChange}
          placeholder={t("phoneInput.placeholder")}
          border="none"
          _focus={{ boxShadow: "none" }}
          borderRadius="0"
        />
      </Flex>

      {/* Country dropdown */}
      {isOpen && (
        <Box
          ref={dropdownRef}
          position="absolute"
          top="100%"
          left="0"
          mt="1"
          w="320px"
          bg="bg"
          borderWidth="1px"
          borderRadius="md"
          shadow="lg"
          zIndex="dropdown"
          overflow="hidden"
        >
          {/* Search */}
          <Box p="2" borderBottomWidth="1px">
            <Input
              size="sm"
              placeholder={t("phoneInput.searchCountry")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </Box>

          {/* Country list */}
          <Box maxH="240px" overflowY="auto">
            {filteredCountries.map((country) => (
              <Flex
                key={country.iso2}
                align="center"
                gap="3"
                px="3"
                py="2"
                cursor="pointer"
                _hover={{ bg: "bg.muted" }}
                bg={
                  phoneInput.country?.iso2 === country.iso2
                    ? "bg.muted"
                    : "transparent"
                }
                onClick={() => {
                  setCountry(country.iso2)
                  setIsOpen(false)
                  setSearch("")
                  phoneInput.inputRef.current?.focus()
                }}
              >
                <Text fontSize="lg" lineHeight="1" flexShrink={0}>
                  {getCountryFlag(country.iso2)}
                </Text>
                <Text fontSize="sm" flex="1" truncate>
                  {country.name}
                </Text>
                <Text fontSize="sm" color="fg.muted" flexShrink={0}>
                  +{country.dialCode}
                </Text>
              </Flex>
            ))}

            {filteredCountries.length === 0 && (
              <Text px="3" py="4" fontSize="sm" color="fg.muted" textAlign="center">
                {t("phoneInput.noCountry")}
              </Text>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}
