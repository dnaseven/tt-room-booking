import { Input as ShadcnInput } from '../vendor/shadcn/input'

export type InputProps = {
  id: string
  type?: 'text' | 'date'
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  describedBy?: string
  disabled?: boolean
}

export const Input = ({ id, type = 'text', value, onChange, invalid, describedBy, disabled }: InputProps) => (
  <ShadcnInput
    id={id}
    type={type}
    value={value}
    disabled={disabled}
    aria-invalid={invalid || undefined}
    aria-describedby={describedBy}
    onChange={(event) => onChange(event.target.value)}
  />
)
