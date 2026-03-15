import ptBR from "./pt-BR"
import es from "./es"
import type { TranslationKey } from "./pt-BR"

export type Locale = "pt-BR" | "es"

export type { TranslationKey }

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  "pt-BR": ptBR,
  es,
}

export const localeNames: Record<Locale, string> = {
  "pt-BR": "Português",
  es: "Español",
}
