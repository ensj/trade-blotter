export function compareTimestamps(a: string, b: string): number {
  return Date.parse(a) - Date.parse(b)
}
