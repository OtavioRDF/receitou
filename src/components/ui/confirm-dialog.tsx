"use client"

import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
} from "@chakra-ui/react"
import { Button, Text } from "@chakra-ui/react"
import { useLocale } from "@/hooks/use-locale"

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
}: ConfirmDialogProps) {
  const { t } = useLocale()

  return (
    <DialogRoot
      open={open}
      onOpenChange={(details) => {
        if (!details.open) onClose()
      }}
      placement="center"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? t("confirmDialog.defaultTitle")}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text color="fg.muted">{description ?? t("confirmDialog.defaultDesc")}</Text>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {cancelLabel ?? t("common.cancel")}
          </Button>
          <Button
            colorPalette="red"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel ?? t("common.delete")}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
