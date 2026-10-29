import { CircleAlert, LoaderCircle, Trash2 } from 'lucide-react'

const ICONS = {
  alert: CircleAlert,
  spinner: LoaderCircle,
  trash: Trash2,
}

export type IconName = keyof typeof ICONS

export const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const Component = ICONS[name]

  return <Component aria-hidden="true" className={className} />
}
