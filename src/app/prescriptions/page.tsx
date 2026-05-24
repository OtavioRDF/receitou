"use client"

import { useState, useMemo } from "react"
import { VStack, Text, Button, Flex, Input } from "@chakra-ui/react"
import { LuPlus, LuArrowUpDown } from "react-icons/lu"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { PrescriptionCard } from "@/components/prescricao/prescription-card"
import { usePrescriptions } from "@/hooks/use-prescriptions"
import { useLocale } from "@/hooks/use-locale"
import { toaster } from "@/components/ui/toaster"

export default function PrescriptionsPage() {
  const { prescriptions, isLoaded, remove, duplicate } = usePrescriptions()
  const { t } = useLocale()
  const [search, setSearch] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  const filtered = useMemo(() => {
    let result = [...prescriptions]

    if (search.trim()) {
      const term = search.toLowerCase().trim()
      result = result.filter((p) =>
        p.patient.name.toLowerCase().includes(term)
      )
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

    return result
  }, [prescriptions, search, sortOrder])

  const handleDuplicate = (id: string) => {
    const item = duplicate(id)
    if (item) {
      toaster.success({ title: t("prescriptions.duplicatedSuccess") })
    }
  }

  return (
    <>
      <Header title={t("prescriptions.title")}>
        <Link href="/prescriptions/new">
          <Button size="sm" colorPalette="blue">
            <LuPlus />
            {t("prescriptions.new")}
          </Button>
        </Link>
      </Header>

      {!isLoaded ? (
        <Text color="fg.muted">{t("common.loading")}</Text>
      ) : prescriptions.length === 0 ? (
        <VStack py="16" gap="4">
          <Text color="fg.muted" fontSize="lg">
            {t("prescriptions.empty")}
          </Text>
          <Link href="/prescriptions/new">
            <Button colorPalette="blue">
              <LuPlus />
              {t("prescriptions.createFirst")}
            </Button>
          </Link>
        </VStack>
      ) : (
        <>
          <Flex gap="3" mb="4" align="center">
            <Input
              placeholder={t("prescriptions.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxW="400px"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortOrder((prev) =>
                  prev === "newest" ? "oldest" : "newest"
                )
              }
              flexShrink={0}
            >
              <LuArrowUpDown />
              {sortOrder === "newest"
                ? t("prescriptions.sortNewest")
                : t("prescriptions.sortOldest")}
            </Button>
          </Flex>

          {filtered.length === 0 ? (
            <Text color="fg.muted" py="8" textAlign="center">
              {t("prescriptions.noResults", { term: search })}
            </Text>
          ) : (
            <VStack gap="4" align="stretch">
              {filtered.map((p) => (
                <PrescriptionCard
                  key={p.id}
                  prescription={p}
                  onRemove={remove}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </VStack>
          )}
        </>
      )}
    </>
  )
}
