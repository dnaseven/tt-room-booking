import type { ReactNode } from 'react'
import { Alert as ShadcnAlert, AlertDescription } from '../vendor/shadcn/alert'
import { Icon } from './icon'

const VARIANTS = {
  error: 'destructive',
} as const

export type AlertProps = {
  variant?: keyof typeof VARIANTS
  children: ReactNode
}

export const Alert = ({ variant = 'error', children }: AlertProps) => (
  <ShadcnAlert variant={VARIANTS[variant]}>
    <Icon name="alert" />
    <AlertDescription>{children}</AlertDescription>
  </ShadcnAlert>
)
