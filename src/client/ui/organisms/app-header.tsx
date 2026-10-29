import { useId } from 'react'
import { Heading } from '../atoms/heading'
import { Label } from '../atoms/label'
import { Select } from '../atoms/select'

export type AppHeaderProps = {
  title: string
  languageLabel: string
  languages: { value: string; label: string }[]
  language: string
  onLanguageChange: (language: string) => void
}

export const AppHeader = ({ title, languageLabel, languages, language, onLanguageChange }: AppHeaderProps) => {
  const id = useId()

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
      <Heading>{title}</Heading>
      <div className="flex items-center gap-2">
        <Label htmlFor={id}>{languageLabel}</Label>
        <Select id={id} value={language} options={languages} onChange={onLanguageChange} />
      </div>
    </header>
  )
}
