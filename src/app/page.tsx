"use client"

import { SimpleGrid, Box, Text, Flex, Icon } from "@chakra-ui/react"
import { LuFileText, LuLayoutTemplate, LuPlus } from "react-icons/lu"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { usePrescricoes } from "@/hooks/use-prescricoes"
import { useTemplates } from "@/hooks/use-templates"
import { useLocale } from "@/hooks/use-locale"

function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string
  value: number
  icon: React.ElementType
  href: string
}) {
  return (
    <Link href={href}>
      <Box
        p="6"
        borderWidth="1px"
        borderRadius="lg"
        _hover={{ shadow: "md", borderColor: "blue.300" }}
        transition="all 0.15s"
      >
        <Flex align="center" justify="space-between" mb="4">
          <Icon as={icon} boxSize="6" color="blue.500" />
        </Flex>
        <Text fontSize="3xl" fontWeight="bold">
          {value}
        </Text>
        <Text color="fg.muted" fontSize="sm">
          {label}
        </Text>
      </Box>
    </Link>
  )
}

function QuickAction({
  label,
  href,
}: {
  label: string
  href: string
}) {
  return (
    <Link href={href}>
      <Flex
        align="center"
        gap="3"
        p="4"
        borderWidth="1px"
        borderRadius="lg"
        _hover={{ shadow: "sm", borderColor: "blue.300" }}
        transition="all 0.15s"
      >
        <Icon as={LuPlus} boxSize="5" color="blue.500" />
        <Text fontWeight="medium">{label}</Text>
      </Flex>
    </Link>
  )
}

export default function Dashboard() {
  const { prescricoes } = usePrescricoes()
  const { templates } = useTemplates()
  const { t } = useLocale()

  return (
    <>
      <Header title={t("dashboard.title")} />

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="6" mb="8">
        <StatCard
          label={t("dashboard.prescriptions")}
          value={prescricoes.length}
          icon={LuFileText}
          href="/prescricoes"
        />
        <StatCard
          label={t("dashboard.templates")}
          value={templates.length}
          icon={LuLayoutTemplate}
          href="/templates"
        />
      </SimpleGrid>

      <Text fontSize="lg" fontWeight="semibold" mb="4">
        {t("dashboard.quickActions")}
      </Text>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
        <QuickAction label={t("dashboard.newPrescription")} href="/prescricoes/nova" />
        <QuickAction label={t("dashboard.newTemplate")} href="/templates/novo" />
      </SimpleGrid>
    </>
  )
}
