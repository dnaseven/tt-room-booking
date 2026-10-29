import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { createBookingsApi } from '@client/api/bookings.api'
import { createI18n } from '@client/i18n/create-i18n'
import type { Language } from '@client/i18n/languages'
import { BookingsApiProvider } from '../../hooks/bookings-api-provider'
import { BookingScreen } from '../booking-screen'
import { NOW, makeStorage } from './test-doubles'

export const renderScreen = (language: Language = 'en') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const storage = makeStorage()

  render(
    <QueryClientProvider client={queryClient}>
      <BookingsApiProvider api={createBookingsApi({ baseUrl: 'http://localhost' })}>
        <I18nextProvider i18n={createI18n(language)}>
          <BookingScreen now={() => NOW} storage={storage} />
        </I18nextProvider>
      </BookingsApiProvider>
    </QueryClientProvider>,
  )

  return { storage }
}
