"use client"

import { Box, VStack, Text, Flex, Icon } from "@chakra-ui/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LuLayoutDashboard,
  LuFileText,
  LuLayoutTemplate,
  LuSettings,
} from "react-icons/lu"
import { useLocale } from "@/hooks/use-locale"
import type { TranslationKey } from "@/locales"

const navItems: { href: string; labelKey: TranslationKey; icon: React.ElementType }[] = [
  { href: "/", labelKey: "sidebar.dashboard", icon: LuLayoutDashboard },
  { href: "/prescricoes", labelKey: "sidebar.prescriptions", icon: LuFileText },
  { href: "/templates", labelKey: "sidebar.templates", icon: LuLayoutTemplate },
  { href: "/configuracoes", labelKey: "sidebar.settings", icon: LuSettings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLocale()

  return (
    <Box
      as="nav"
      w="240px"
      minH="100vh"
      bg="gray.900"
      color="white"
      py="6"
      px="4"
      position="fixed"
      left="0"
      top="0"
    >
      <Flex direction="column" h="full">
        <Text fontSize="xl" fontWeight="bold" mb="8" px="3">
          Receitou
        </Text>

        <VStack gap="1" align="stretch">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)

            return (
              <Link key={item.href} href={item.href}>
                <Flex
                  align="center"
                  gap="3"
                  px="3"
                  py="2.5"
                  borderRadius="md"
                  fontWeight="medium"
                  fontSize="sm"
                  bg={isActive ? "whiteAlpha.200" : "transparent"}
                  _hover={{ bg: "whiteAlpha.100" }}
                  transition="background 0.15s"
                >
                  <Icon as={item.icon} boxSize="5" />
                  <Text>{t(item.labelKey)}</Text>
                </Flex>
              </Link>
            )
          })}
        </VStack>
      </Flex>
    </Box>
  )
}
