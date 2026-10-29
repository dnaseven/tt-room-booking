// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DateNavigator, type DateNavigatorLabels, type DateNavigatorProps } from '../date-navigator'

const labels: DateNavigatorLabels = { previous: 'Previous day', next: 'Next day', today: 'Today', date: 'Date' }

const renderNavigator = () => {
  const props: DateNavigatorProps = {
    value: '2026-10-30',
    labels,
    onChange: vi.fn(),
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onToday: vi.fn(),
  }
  render(<DateNavigator {...props} />)

  return props
}

afterEach(cleanup)

describe('DateNavigator', () => {
  it('shows the date in a labelled date input', () => {
    renderNavigator()

    const input = screen.getByLabelText(labels.date) as HTMLInputElement

    expect(input.type).toBe('date')
    expect(input.value).toBe('2026-10-30')
  })

  it('reports the date typed into the input', () => {
    const { onChange } = renderNavigator()

    fireEvent.change(screen.getByLabelText(labels.date), { target: { value: '2026-11-02' } })

    expect(onChange).toHaveBeenCalledExactlyOnceWith('2026-11-02')
  })

  it('calls onPrevious, onNext and onToday from their buttons', () => {
    const { onPrevious, onNext, onToday } = renderNavigator()

    fireEvent.click(screen.getByRole('button', { name: labels.previous }))
    fireEvent.click(screen.getByRole('button', { name: labels.next }))
    fireEvent.click(screen.getByRole('button', { name: labels.today }))

    expect(onPrevious).toHaveBeenCalledOnce()
    expect(onNext).toHaveBeenCalledOnce()
    expect(onToday).toHaveBeenCalledOnce()
  })
})
