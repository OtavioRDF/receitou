"use client"

import { Flex, Text } from "@chakra-ui/react"
import { ColorModeButton } from "@/components/ui/color-mode"
import { LocaleSwitcher } from "@/components/ui/locale-switcher"

interface HeaderProps {
  title: string
  children?: React.ReactNode
}

export function Header({ title, children }: HeaderProps) {
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      py="4"
      mb="6"
      borderBottomWidth="1px"
      borderColor="border"
    >
      <Text fontSize="2xl" fontWeight="bold">
        {title}
      </Text>
      <Flex align="center" gap="3">
        {children}
        <LocaleSwitcher />
        <ColorModeButton />
      </Flex>
    </Flex>
  )
}
