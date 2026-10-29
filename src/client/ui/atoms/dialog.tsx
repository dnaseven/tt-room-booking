import type { ReactNode } from 'react'
import {
  Dialog as ShadcnDialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../vendor/shadcn/dialog'

export type DialogProps = {
  open: boolean
  title: string
  description: string
  footer: ReactNode
  onClose: () => void
}

export const Dialog = ({ open, title, description, footer, onClose }: DialogProps) => (
  <ShadcnDialog open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>{footer}</DialogFooter>
    </DialogContent>
  </ShadcnDialog>
)
