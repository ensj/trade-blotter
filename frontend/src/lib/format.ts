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

export function formatQuantity(value: number, locale?: string): string {
  return value.toLocaleString(locale, { maximumFractionDigits: 4 })
}

export function formatPrice(value: number, locale?: string): string {
  return value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

export function formatMoney(value: number, locale?: string): string {
  return value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
