// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DayScheduleTemplate, type DayScheduleTemplateProps } from '../day-schedule-template'

const renderTemplate = (overrides: Partial<DayScheduleTemplateProps> = {}) => {
  const props: DayScheduleTemplateProps = {
    header: <div>header content</div>,
    navigator: <div>navigator content</div>,
    main: <div>main content</div>,
    panel: <div>panel content</div>,
    panelTitle: 'Booking details',
    closeLabel: 'Close details',
    isPanelOpen: false,
    onClosePanel: vi.fn(),
    ...overrides,
  }
  render(<DayScheduleTemplate {...props} />)

  return props
}

afterEach(cleanup)

describe('DayScheduleTemplate', () => {
  it('places the header and the navigator', () => {
    renderTemplate()

    expect(screen.getByText('header content')).toBeTruthy()
    expect(screen.getByText('navigator content')).toBeTruthy()
  })

  it('places the main content in the main landmark', () => {
    renderTemplate()

    expect(screen.getByRole('main').textContent).toContain('main content')
  })

  it('places the panel in a complementary landmark named by the panel title', () => {
    renderTemplate()

    expect(screen.getByRole('complementary', { name: 'Booking details' }).textContent).toContain('panel content')
  })

  it('marks the panel as open or closed', () => {
    renderTemplate({ isPanelOpen: true })

    expect(screen.getByRole('complementary', { name: 'Booking details' }).getAttribute('data-open')).toBe('true')
  })

  it('marks the panel as closed by default', () => {
    renderTemplate()

    expect(screen.getByRole('complementary', { name: 'Booking details', hidden: true }).getAttribute('data-open')).toBe(
      'false',
    )
  })

  it('offers a close button only while the panel is open', () => {
    const { onClosePanel } = renderTemplate({ isPanelOpen: true })

    fireEvent.click(screen.getByRole('button', { name: 'Close details' }))

    expect(onClosePanel).toHaveBeenCalledOnce()
  })

  it('has no close button while the panel is closed', () => {
    renderTemplate()

    expect(screen.queryByRole('button', { name: 'Close details', hidden: true })).toBeNull()
  })
})
