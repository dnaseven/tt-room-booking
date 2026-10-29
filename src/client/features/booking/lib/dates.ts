const pad = (value: number) => String(value).padStart(2, '0')

export const formatDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const shiftDate = (date: string, days: number) => {
  const [year, month, day] = date.split('-').map(Number)

  return formatDate(new Date(year, month - 1, day + days))
}
