"use client"

import { useRef } from "react"
import { Box, Button, Flex, Text, Image, IconButton } from "@chakra-ui/react"
import { LuUpload, LuTrash2 } from "react-icons/lu"
import { useLocale } from "@/hooks/use-locale"

interface LogoUploadProps {
  value?: string
  onChange: (base64: string | undefined) => void
}

const MAX_SIZE_KB = 500

export function LogoUpload({ value, onChange }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useLocale()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert(t("logoUpload.invalidFile"))
      return
    }

    if (file.size > MAX_SIZE_KB * 1024) {
      alert(t("logoUpload.fileTooLarge", { size: MAX_SIZE_KB }))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      onChange(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        onChange={handleFile}
        style={{ display: "none" }}
      />

      {value ? (
        <Flex
          align="center"
          gap="4"
          p="3"
          borderWidth="1px"
          borderRadius="md"
        >
          <Image
            src={value}
            alt="Logo"
            maxH="60px"
            maxW="180px"
            objectFit="contain"
          />
          <Flex gap="2" ml="auto">
            <Button
              size="xs"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              {t("common.change")}
            </Button>
            <IconButton
              aria-label={t("logoUpload.removeLogo")}
              size="xs"
              variant="ghost"
              colorPalette="red"
              onClick={() => onChange(undefined)}
            >
              <LuTrash2 />
            </IconButton>
          </Flex>
        </Flex>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="2"
          p="6"
          borderWidth="2px"
          borderStyle="dashed"
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: "bg.muted" }}
          transition="background 0.15s"
          onClick={() => inputRef.current?.click()}
        >
          <LuUpload size={24} />
          <Text fontSize="sm" color="fg.muted">
            {t("logoUpload.clickToUpload")}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            {t("logoUpload.fileTypes", { size: MAX_SIZE_KB })}
          </Text>
        </Flex>
      )}
    </Box>
  )
}
