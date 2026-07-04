import type { Recipe, MealType } from '../types'

const defaultMealTypes: MealType[] = ['朝食', '昼食', '夕食']

interface Props {
  weekDates: string[]
  weekLabel: string
  days: { date: string; entries: { recipeId: string; mealType: MealType }[] }[]
  recipes: Recipe[]
  activeRecipes: Recipe[]
  visibleMealTypes: MealType[]
  formatDate: (date: string) => string
  onSetMeal: (date: string, mealType: MealType, recipeId: string | null) => void
  onPrevWeek: () => void
  onNextWeek: () => void
  onRandomize: () => void
}

export function WeeklyMenu({ weekDates, weekLabel, days, recipes, activeRecipes, visibleMealTypes, formatDate, onSetMeal, onPrevWeek, onNextWeek, onRandomize }: Props) {
  const getRecipeId = (date: string, mealType: MealType) => {
    const day = days.find(d => d.date === date)
    return day?.entries.find(e => e.mealType === mealType)?.recipeId ?? null
  }

  const gridCols = `80px repeat(${visibleMealTypes.length}, 1fr)`

  const getSpanOrigin = (date: string, mealType: MealType): string | null => {
    const day = days.find(d => d.date === date)
    const entry = day?.entries.find(e => e.mealType === mealType)
    if (!entry) return null
    const recipe = recipes.find(r => r.id === entry.recipeId)
    if (!recipe || (recipe.days ?? 1) <= 1) return null
    for (let i = 1; i < (recipe.days ?? 1); i++) {
      const d = new Date(date)
      d.setDate(d.getDate() - i)
      const prev = d.toISOString().slice(0, 10)
      const prevDay = days.find(dd => dd.date === prev)
      if (prevDay?.entries.some(e => e.mealType === mealType && e.recipeId === entry.recipeId)) {
        return prev
      }
    }
    return null
  }

  return (
    <div className="menu-section">
      <div className="menu-header-row">
        <button className="btn nav-arrow" onClick={onPrevWeek}>‹</button>
        <h2>{weekLabel}</h2>
        <button className="btn nav-arrow" onClick={onNextWeek}>›</button>
        <button className="btn shuffle" onClick={onRandomize}>🎲 ランダム</button>
      </div>
      <div className="menu-grid" style={{ gridTemplateColumns: gridCols }}>
        <div className="menu-header">日付</div>
        {visibleMealTypes.map(m => (
          <div key={m} className="menu-header">{m}</div>
        ))}
        {weekDates.map(date => (
          <div key={date} className="menu-row" style={{ display: 'contents' }}>
            <div className="menu-date">{formatDate(date)}</div>
            {visibleMealTypes.map(mealType => {
              const recipeId = getRecipeId(date, mealType)
              const recipe = recipes.find(r => r.id === recipeId)
              const spanOrigin = recipe ? getSpanOrigin(date, mealType) : null
              return (
                <div key={`${date}-${mealType}`} className={`menu-cell${spanOrigin ? ' spanned' : ''}`}>
                  <select
                    value={recipeId ?? ''}
                    onChange={e => onSetMeal(date, mealType, e.target.value || null)}
                  >
                    <option value="">--</option>
                    {activeRecipes
                      .filter(r => (r.mealTypes ?? defaultMealTypes).includes(mealType))
                      .map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                  </select>
                  {recipe && recipe.ingredients.length > 0 && (
                    <div className="cell-ingredients">
                      {spanOrigin && <span className="span-label">↳ </span>}
                      {recipe.ingredients.join('、')}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
