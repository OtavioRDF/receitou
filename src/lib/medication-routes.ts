import type { TranslationKey } from "@/locales"

export interface RouteOption {
  value: string
  labelKey: TranslationKey
}

export const MEDICATION_ROUTES: RouteOption[] = [
  { value: "Oral", labelKey: "medications.routeOral" },
  { value: "Sublingual", labelKey: "medications.routeSublingual" },
  { value: "Intravenosa", labelKey: "medications.routeIntravenous" },
  { value: "Intramuscular", labelKey: "medications.routeIntramuscular" },
  { value: "Subcutânea", labelKey: "medications.routeSubcutaneous" },
  { value: "Tópica", labelKey: "medications.routeTopical" },
  { value: "Retal", labelKey: "medications.routeRectal" },
  { value: "Inalatória", labelKey: "medications.routeInhalation" },
  { value: "Nasal", labelKey: "medications.routeNasal" },
  { value: "Oftálmica", labelKey: "medications.routeOphthalmic" },
  { value: "Otológica", labelKey: "medications.routeOtic" },
  { value: "Transdérmica", labelKey: "medications.routeTransdermal" },
  { value: "Vaginal", labelKey: "medications.routeVaginal" },
  { value: "Intradérmica", labelKey: "medications.routeIntradermal" },
]
