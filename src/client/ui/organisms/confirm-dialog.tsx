export type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  isConfirming: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = (_props: ConfirmDialogProps) => null
