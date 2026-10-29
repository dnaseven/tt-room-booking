import { useId } from 'react'
import { Button } from '../atoms/button'
import { IconButton } from '../atoms/icon-button'
import { Input } from '../atoms/input'
import { FormField } from './form-field'

export type DateNavigatorLabels = {
  previous: string
  next: string
  today: string
  date: string
}

export type DateNavigatorProps = {
  value: string
  labels: DateNavigatorLabels
  onChange: (date: string) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

export const DateNavigator = ({ value, labels, onChange, onPrevious, onNext, onToday }: DateNavigatorProps) => {
  const id = useId()

  return (
    <div className="flex flex-wrap items-end gap-2">
      <IconButton icon="previous" label={labels.previous} onClick={onPrevious} />
      <FormField id={id} label={labels.date}>
        {(control) => <Input {...control} type="date" value={value} onChange={onChange} />}
      </FormField>
      <IconButton icon="next" label={labels.next} onClick={onNext} />
      <Button variant="secondary" onClick={onToday}>
        {labels.today}
      </Button>
    </div>
  )
}
