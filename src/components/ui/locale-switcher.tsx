"use client"

import { Button, Text } from "@chakra-ui/react"
import { useLocale } from "@/hooks/use-locale"
import type { Locale } from "@/locales"

const localeFlags: Record<Locale, string> = {
  "pt-BR": "🇧🇷",
  es: "🇪🇸",
}

const nextLocale: Record<Locale, Locale> = {
  "pt-BR": "es",
  es: "pt-BR",
}

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(nextLocale[locale])}
      px="2"
      minW="auto"
    >
      <Text fontSize="lg" lineHeight="1">
        {localeFlags[locale]}
      </Text>
      <Text fontSize="xs" fontWeight="medium">
        {locale === "pt-BR" ? "PT" : "ES"}
      </Text>
    </Button>
  )
}
