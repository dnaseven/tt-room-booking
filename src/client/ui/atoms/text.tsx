import type { ReactNode } from 'react'

const TONES = {
  default: '',
  muted: 'text-sm text-muted-foreground',
  error: 'text-sm text-destructive',
}

export type TextProps = {
  id?: string
  tone?: keyof typeof TONES
  children: ReactNode
}

export const Text = ({ id, tone = 'default', children }: TextProps) => (
  <p id={id} className={TONES[tone]}>
    {children}
  </p>
)
