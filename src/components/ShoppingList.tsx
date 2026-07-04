import type { Recipe, MealType } from '../types'

interface Props {
  days: { date: string; entries: { recipeId: string; mealType: MealType }[] }[]
  recipes: Recipe[]
}

export function ShoppingList({ days, recipes }: Props) {
  const usedRecipeIds = new Set(days.flatMap(d => d.entries.map(e => e.recipeId)))
  const ingredientCount = new Map<string, number>()

  for (const recipeId of usedRecipeIds) {
    const recipe = recipes.find(r => r.id === recipeId)
    if (!recipe) continue
    for (const ingredient of recipe.ingredients) {
      ingredientCount.set(ingredient, (ingredientCount.get(ingredient) ?? 0) + 1)
    }
  }

  const ingredients = [...ingredientCount.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  if (ingredients.length === 0) return null

  return (
    <div className="shopping-section">
      <h2>買い物リスト</h2>
      <ul className="shopping-list">
        {ingredients.map(([name, count]) => (
          <li key={name}>
            <label>
              <input type="checkbox" />
              <span>{name}</span>
              {count > 1 && <span className="count">×{count}</span>}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
