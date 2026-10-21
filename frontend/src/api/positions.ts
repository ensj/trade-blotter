import { request } from './http'
import type { Position } from './types'

export function getPositions(): Promise<Position[]> {
  return request<Position[]>('/positions')
}
