// `locale` and `timeZone` default to the browser's; tests pass them explicitly.

export function formatTimestamp(iso: string, locale?: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(new Date(iso))
}

// Today's trades show HH:mm:ss; older ones prefix "dd MMM". "Today" is judged in `timeZone`.
export function formatTradeTime(
  iso: string,
  now: Date = new Date(),
  locale?: string,
  timeZone?: string,
): string {
  const date = new Date(iso)
  const day = new Intl.DateTimeFormat('en-CA', { dateStyle: 'short', timeZone })
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(date)
  if (day.format(date) === day.format(now)) return time
  const parts = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    timeZone,
  }).formatToParts(date)
  const part = (type: string) => parts.find((p) => p.type === type)?.value
  return `${part('day')} ${part('month')} ${time}`
}

export function formatQuantity(value: number, locale?: string): string {
  return value.toLocaleString(locale, { maximumFractionDigits: 4 })
}

export function formatPrice(value: number, locale?: string): string {
  return value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

export function formatMoney(value: number, locale?: string): string {
  return value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
