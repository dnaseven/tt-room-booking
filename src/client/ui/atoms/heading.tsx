import type { ReactNode } from 'react'

const LEVELS = {
  1: { Tag: 'h1', className: 'text-xl font-semibold' },
  2: { Tag: 'h2', className: 'text-lg font-semibold' },
} as const

export type HeadingProps = {
  level?: keyof typeof LEVELS
  children: ReactNode
}

export const Heading = ({ level = 1, children }: HeadingProps) => {
  const { Tag, className } = LEVELS[level]

  return <Tag className={className}>{children}</Tag>
}
