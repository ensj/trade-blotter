import { defineStore } from 'pinia'
import { getPositions } from '../api/positions'
import { useResource } from './resource'

export const usePositionsStore = defineStore('positions', () => {
  const { items: positions, loading, error, load: fetchPositions } = useResource(getPositions)
  return { positions, loading, error, fetchPositions }
})
