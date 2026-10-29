import { Button as ShadcnButton } from '../vendor/shadcn/button'
import { Icon, type IconName } from './icon'

export type IconButtonProps = {
  icon: IconName
  label: string
  onClick: () => void
}

export const IconButton = ({ icon, label, onClick }: IconButtonProps) => (
  <ShadcnButton type="button" variant="outline" size="icon" aria-label={label} onClick={onClick}>
    <Icon name={icon} />
  </ShadcnButton>
)
