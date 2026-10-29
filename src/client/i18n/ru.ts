import type { Dictionary } from './en'

export const ru: Dictionary = {
  app: { title: 'Бронирование переговорной' },
  language: { label: 'Язык', en: 'English', ru: 'Русский' },
  date: { label: 'Дата', previous: 'Предыдущий день', next: 'Следующий день', today: 'Сегодня' },
  timeline: {
    slot: {
      free: '{{start}}–{{end}}, свободно',
      booked: '{{start}}–{{end}}, занято',
      past: '{{start}}–{{end}}, недоступно',
    },
    booking: { titled: '{{title}}, {{start}}–{{end}}', untitled: 'Бронь, {{start}}–{{end}}' },
    empty: { title: 'На этот день броней нет', description: 'Выберите свободный слот, чтобы забронировать комнату' },
  },
  loading: { bookings: 'Загружаем брони' },
  loadError: { title: 'Не удалось загрузить брони', retry: 'Повторить' },
  panel: { title: 'Детали брони', close: 'Закрыть', placeholder: 'Выберите свободный слот или существующую бронь' },
  form: {
    date: 'Дата',
    start: 'Начало',
    end: 'Окончание',
    title: 'Название (необязательно)',
    create: 'Забронировать',
    save: 'Сохранить изменения',
    submitting: 'Сохраняем…',
    delete: 'Удалить бронь',
  },
  confirmDelete: {
    title: 'Удалить эту бронь?',
    description: 'Бронь будет удалена. Это действие нельзя отменить.',
    confirm: 'Удалить',
    cancel: 'Отмена',
  },
  errors: {
    INVALID_INPUT: 'Проверьте формат даты и времени.',
    INVALID_RANGE: 'Окончание должно быть позже начала.',
    OUT_OF_WORK_HOURS: 'Комната доступна с 09:00 до 18:00.',
    DURATION_TOO_SHORT: 'Бронь должна длиться не меньше 30 минут.',
    DURATION_TOO_LONG: 'Бронь не может длиться дольше 2 часов.',
    PAST_TIME: 'Это время уже прошло.',
    BOOKING_CONFLICT: 'Это время только что заняли другой бронью. Расписание обновлено.',
    BOOKING_NOT_FOUND: 'Такой брони больше нет. Расписание обновлено.',
    INTERNAL_ERROR: 'Что-то пошло не так на сервере. Попробуйте ещё раз.',
    NETWORK_ERROR: 'Ошибка сети. Проверьте соединение и попробуйте ещё раз.',
    INVALID_RESPONSE: 'Сервер прислал неожиданный ответ. Попробуйте ещё раз.',
  },
}
