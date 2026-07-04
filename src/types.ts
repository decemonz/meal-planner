export type MealType = '朝食' | '昼食' | '夕食'

export type MealVisibility = Record<MealType, boolean>

export interface Recipe {
  id: string
  name: string
  category: string
  ingredients: string[]
  days: number
  favorite?: boolean
  active?: boolean
  mealTypes?: MealType[]
}

export interface MenuEntry {
  recipeId: string
  mealType: MealType
}

export interface DayMenu {
  date: string
  entries: MenuEntry[]
}

export interface WeeklyMenu {
  weekStart: string
  days: DayMenu[]
}
