import type { ReactNode } from 'react'
import { Label as ShadcnLabel } from '../vendor/shadcn/label'

export const Label = ({ htmlFor, children }: { htmlFor: string; children: ReactNode }) => (
  <ShadcnLabel htmlFor={htmlFor}>{children}</ShadcnLabel>
)
