// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppHeader, type AppHeaderProps } from '../app-header'

const renderHeader = () => {
  const props: AppHeaderProps = {
    title: 'Room booking',
    languageLabel: 'Language',
    languages: [
      { value: 'en', label: 'English' },
      { value: 'ru', label: 'Русский' },
    ],
    language: 'ru',
    onLanguageChange: vi.fn(),
  }
  render(<AppHeader {...props} />)

  return props
}

afterEach(cleanup)

describe('AppHeader', () => {
  it('shows the title as the main heading', () => {
    renderHeader()

    expect(screen.getByRole('heading', { level: 1, name: 'Room booking' })).toBeTruthy()
  })

  it('offers the languages in a labelled select with the current one chosen', () => {
    renderHeader()

    const select = screen.getByLabelText('Language') as HTMLSelectElement

    expect(Array.from(select.options).map((option) => option.value)).toEqual(['en', 'ru'])
    expect(select.value).toBe('ru')
  })

  it('reports the chosen language', () => {
    const { onLanguageChange } = renderHeader()

    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'en' } })

    expect(onLanguageChange).toHaveBeenCalledExactlyOnceWith('en')
  })
})
