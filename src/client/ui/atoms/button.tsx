import type { ReactNode } from 'react'
import { Button as ShadcnButton } from '../vendor/shadcn/button'
import { Spinner } from './spinner'

const VARIANTS = {
  primary: 'default',
  secondary: 'secondary',
  destructive: 'destructive',
  ghost: 'ghost',
} as const

export type ButtonProps = {
  variant?: keyof typeof VARIANTS
  type?: 'button' | 'submit'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
}

export const Button = ({
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled = false,
  onClick,
  children,
}: ButtonProps) => (
  <ShadcnButton
    variant={VARIANTS[variant]}
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    onClick={onClick}
  >
    {loading && <Spinner />}
    {children}
  </ShadcnButton>
)
