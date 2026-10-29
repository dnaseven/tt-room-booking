export type AppHeaderProps = {
  title: string
  languageLabel: string
  languages: { value: string; label: string }[]
  language: string
  onLanguageChange: (language: string) => void
}

export const AppHeader = (_props: AppHeaderProps) => null
