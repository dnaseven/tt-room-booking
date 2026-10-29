import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import './index.css'
import { createBookingsApi } from './api/bookings.api'
import { BookingsApiProvider } from './features/booking/hooks/bookings-api-provider'
import { BookingScreen } from './features/booking/screens/booking-screen'
import { createI18n } from './i18n/create-i18n'
import { detectLanguage } from './i18n/detect-language'
import { loadLanguage } from './i18n/language-storage'

export const renderClient = (container: HTMLElement) => {
  const storage = window.localStorage
  const queryClient = new QueryClient()
  const api = createBookingsApi()
  const i18n = createI18n(
    detectLanguage({ stored: loadLanguage(storage), navigatorLanguages: window.navigator.languages }),
  )

  createRoot(container).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BookingsApiProvider api={api}>
          <I18nextProvider i18n={i18n}>
            <BookingScreen now={() => new Date()} storage={storage} />
          </I18nextProvider>
        </BookingsApiProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}
