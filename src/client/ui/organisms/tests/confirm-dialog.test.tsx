// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfirmDialog, type ConfirmDialogProps } from '../confirm-dialog'

const renderDialog = (overrides: Partial<ConfirmDialogProps> = {}) => {
  const props: ConfirmDialogProps = {
    open: true,
    title: 'Delete booking?',
    description: 'This cannot be undone',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    isConfirming: false,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  }
  render(<ConfirmDialog {...props} />)

  return props
}

afterEach(cleanup)

describe('ConfirmDialog', () => {
  it('renders nothing while closed', () => {
    renderDialog({ open: false })

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('is a dialog named by the title and described by the description', () => {
    renderDialog()

    const dialog = screen.getByRole('dialog', { name: 'Delete booking?' })

    expect(dialog.textContent).toContain('This cannot be undone')
  })

  it('calls onConfirm from the confirm button', () => {
    const { onConfirm, onCancel } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('calls onCancel from the cancel button', () => {
    const { onConfirm, onCancel } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onCancel when Escape is pressed', () => {
    const { onCancel } = renderDialog()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('disables both buttons while confirming', () => {
    renderDialog({ isConfirming: true })

    expect((screen.getByRole('button', { name: 'Delete' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement).disabled).toBe(true)
  })
})
