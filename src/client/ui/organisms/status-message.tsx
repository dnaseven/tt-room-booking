import { Alert } from '../atoms/alert'
import { Button } from '../atoms/button'
import { Skeleton } from '../atoms/skeleton'
import { Text } from '../atoms/text'

export type StatusMessageProps =
  | { kind: 'loading'; label: string }
  | { kind: 'empty'; title: string; description?: string }
  | { kind: 'error'; title: string; description?: string; retryLabel: string; onRetry: () => void }

export const StatusMessage = (props: StatusMessageProps) => {
  if (props.kind === 'loading') {
    return (
      <div role="status" aria-busy="true">
        <span className="sr-only">{props.label}</span>
        <div aria-hidden="true" className="flex flex-col gap-2">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </div>
    )
  }

  if (props.kind === 'empty') {
    return (
      <div className="flex flex-col items-center gap-1 py-8 text-center">
        <Text>{props.title}</Text>
        {props.description && <Text tone="muted">{props.description}</Text>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <Alert>
        <span className="font-medium">{props.title}</span>
        {props.description && <span className="block">{props.description}</span>}
      </Alert>
      <Button variant="secondary" onClick={props.onRetry}>
        {props.retryLabel}
      </Button>
    </div>
  )
}
