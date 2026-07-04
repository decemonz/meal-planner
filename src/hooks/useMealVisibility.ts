import { useLocalStorage } from './useLocalStorage'
import type { MealType, MealVisibility } from '../types'

const defaultVisibility: MealVisibility = {
  '朝食': true,
  '昼食': true,
  '夕食': true,
}

export function useMealVisibility() {
  return useLocalStorage<MealVisibility>('mealVisibility', defaultVisibility)
}

export function useMealTypes(visibility: MealVisibility) {
  const allTypes: MealType[] = ['朝食', '昼食', '夕食']
  return allTypes.filter(t => visibility[t])
}
