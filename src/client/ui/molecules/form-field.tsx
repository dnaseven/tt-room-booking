import type { ReactNode } from 'react'
import { Label } from '../atoms/label'
import { Text } from '../atoms/text'

export type FormFieldControl = {
  id: string
  invalid: boolean
  describedBy?: string
}

export type FormFieldProps = {
  id: string
  label: string
  error?: string
  children: (control: FormFieldControl) => ReactNode
}

export const FormField = ({ id, label, error, children }: FormFieldProps) => {
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children({ id, invalid: Boolean(error), describedBy: error ? errorId : undefined })}
      {error && (
        <Text id={errorId} tone="error">
          {error}
        </Text>
      )}
    </div>
  )
}
