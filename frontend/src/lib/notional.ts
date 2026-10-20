// Quantity and price have at most 4 dp, so the exact product has at most 8; rounding there strips float noise.
export function notional(quantity: number, price: number): number {
  return Math.round(quantity * price * 1e8) / 1e8
}
