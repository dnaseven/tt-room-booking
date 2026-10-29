import { NativeSelect, NativeSelectOption } from '../vendor/shadcn/native-select'

export type SelectProps = {
  id: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  invalid?: boolean
  describedBy?: string
  disabled?: boolean
}

export const Select = ({ id, value, options, onChange, invalid, describedBy, disabled }: SelectProps) => (
  <NativeSelect
    id={id}
    value={value}
    disabled={disabled}
    aria-invalid={invalid || undefined}
    aria-describedby={describedBy}
    onChange={(event) => onChange(event.target.value)}
  >
    {options.map((option) => (
      <NativeSelectOption key={option.value} value={option.value}>
        {option.label}
      </NativeSelectOption>
    ))}
  </NativeSelect>
)
