import { Button } from '../atoms/button'
import { Dialog } from '../atoms/dialog'

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

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isConfirming,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Dialog
    open={open}
    title={title}
    description={description}
    onClose={onCancel}
    footer={
      <>
        <Button variant="secondary" disabled={isConfirming} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="destructive" loading={isConfirming} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </>
    }
  />
)
