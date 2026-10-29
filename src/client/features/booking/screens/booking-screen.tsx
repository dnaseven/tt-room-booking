import { BookingPage } from '@client/ui/pages/booking-page'
import { useBookingScreen, type BookingScreenOptions } from './use-booking-screen'

export type BookingScreenProps = BookingScreenOptions

export const BookingScreen = (props: BookingScreenProps) => <BookingPage {...useBookingScreen(props)} />
