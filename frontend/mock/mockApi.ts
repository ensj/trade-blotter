// Dev-only stand-in for the .NET API, enabled with MOCK_API=1.
import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

type Side = 'Buy' | 'Sell'
interface Trade {
  id: string
  symbol: string
  side: Side
  quantity: number
  price: number
  timestamp: string
}

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()
const seed: [string, Side, number, number, number][] = [
  ['AAPL', 'Buy', 100, 187.25, 95],
  ['MSFT', 'Buy', 50, 412.1, 80],
  ['AAPL', 'Buy', 100, 190.75, 64],
  ['TSLA', 'Sell', 30, 248.5, 41],
  ['BRK.B', 'Buy', 12.5, 455.2, 22],
  ['MSFT', 'Sell', 20, 415.0, 9],
]
const trades: Trade[] = seed.map(([symbol, side, quantity, price, ago]) => ({
  id: randomUUID(),
  symbol,
  side,
  quantity,
  price,
  timestamp: minutesAgo(ago),
}))

function positions() {
  const book = new Map<string, { net: number; avg: number }>()
  for (const t of [...trades].sort((a, b) => a.timestamp.localeCompare(b.timestamp))) {
    const signed = t.side === 'Buy' ? t.quantity : -t.quantity
    const p = book.get(t.symbol) ?? { net: 0, avg: 0 }
    const next = p.net + signed
    if (p.net === 0 || Math.sign(signed) === Math.sign(p.net)) {
      p.avg = (Math.abs(p.net) * p.avg + t.quantity * t.price) / (Math.abs(p.net) + t.quantity)
    } else if (Math.sign(next) !== Math.sign(p.net) && next !== 0) {
      p.avg = t.price
    }
    p.net = next
    book.set(t.symbol, p)
  }
  return [...book.entries()]
    .filter(([, p]) => p.net !== 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([symbol, p]) => ({ symbol, netQuantity: p.net, averageCost: Number(p.avg.toFixed(6)) }))
}

function validate(body: Record<string, unknown>): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  const amount = (key: string, label: string, value: unknown) => {
    if (typeof value !== 'number' || value <= 0 || value > 1e9) {
      errors[key] = [`${label} must be greater than 0 and at most 1,000,000,000.`]
    }
  }
  if (typeof body.symbol !== 'string' || !/^[A-Za-z0-9.-]{1,10}$/.test(body.symbol.trim())) {
    errors.symbol = ['Symbol must be 1-10 characters of A-Z, 0-9, . or -.']
  }
  if (body.side !== 'Buy' && body.side !== 'Sell') errors.side = ['Side must be Buy or Sell.']
  amount('quantity', 'Quantity', body.quantity)
  amount('price', 'Price', body.price)
  return errors
}

function send(res: ServerResponse, status: number, body: unknown, type = 'application/json') {
  res.statusCode = status
  res.setHeader('Content-Type', type)
  res.end(JSON.stringify(body))
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  let raw = ''
  for await (const chunk of req) raw += chunk
  try {
    return JSON.parse(raw || '{}')
  } catch {
    return {}
  }
}

export function mockApi(): Plugin {
  return {
    name: 'mock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path === '/positions' && req.method === 'GET') return send(res, 200, positions())
        if (path !== '/trades') return next()
        if (req.method === 'GET') {
          return send(
            res,
            200,
            [...trades].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
          )
        }
        if (req.method !== 'POST') return next()
        const body = await readJson(req)
        const errors = validate(body)
        if (Object.keys(errors).length > 0) {
          return send(
            res,
            400,
            { title: 'One or more validation errors occurred.', status: 400, errors },
            'application/problem+json',
          )
        }
        const trade: Trade = {
          id: randomUUID(),
          symbol: String(body.symbol).trim().toUpperCase(),
          side: body.side as Side,
          quantity: body.quantity as number,
          price: body.price as number,
          timestamp: new Date().toISOString(),
        }
        trades.push(trade)
        res.setHeader('Location', `/trades/${trade.id}`)
        send(res, 201, trade)
      })
    },
  }
}
