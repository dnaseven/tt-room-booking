export type StatusMessageProps =
  | { kind: 'loading'; label: string }
  | { kind: 'empty'; title: string; description?: string }
  | { kind: 'error'; title: string; description?: string; retryLabel: string; onRetry: () => void }

export const StatusMessage = (_props: StatusMessageProps) => null
