import { useState } from 'react'
import type { Recipe, MealType } from '../types'

interface Props {
  recipes: Recipe[]
  currentDays: { date: string; entries: { recipeId: string; mealType: MealType }[] }[]
  nextDays: { date: string; entries: { recipeId: string; mealType: MealType }[] }[]
  currentDates: string[]
  nextDates: string[]
  defaultWeek: 'current' | 'next'
  formatDate: (date: string) => string
}

export function Home({ recipes, currentDays, nextDays, currentDates, nextDates, defaultWeek, formatDate }: Props) {
  const [showNext, setShowNext] = useState(defaultWeek === 'next')

  const menuDays = showNext ? nextDays : currentDays
  const weekDates = showNext ? nextDates : currentDates

  const totalMeals = menuDays.reduce((s, d) => s + d.entries.length, 0)

  const mealOrder: MealType[] = ['朝食', '昼食', '夕食']

  return (
    <div className="home-page">
      <div className="home-week-toggle">
        <button
          className={`chip${!showNext ? ' active' : ''}`}
          onClick={() => setShowNext(false)}
        >今週</button>
        <button
          className={`chip${showNext ? ' active' : ''}`}
          onClick={() => setShowNext(true)}
        >次週</button>
      </div>

      {recipes.length === 0 && (
        <div className="onboarding">
          <p>まずはレシピを登録しましょう</p>
        </div>
      )}

      {recipes.length > 0 && totalMeals > 0 && (
        <div className="week-summary">
          <h3>{showNext ? '次週' : '今週'}の献立</h3>
          {weekDates.map(date => {
            const day = menuDays.find(d => d.date === date)
            if (!day || day.entries.length === 0) return null
            const entries = mealOrder.flatMap(m => {
              const entry = day.entries.find(e => e.mealType === m)
              if (!entry) return []
              const recipe = recipes.find(r => r.id === entry.recipeId)
              if (!recipe) return []
              return [{ mealType: m, recipe }]
            })
            if (entries.length === 0) return null
            return (
              <div key={date} className="day-row">
                <span className="day-label">{formatDate(date)}</span>
                <div className="day-meals">
                  {entries.map(({ mealType, recipe }) => (
                    <span key={mealType} className={`day-meal meal-tag-${mealType}`}>
                      {mealType}: {recipe.name}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {recipes.length > 0 && totalMeals === 0 && (
        <div className="onboarding">
          <p>カレンダーから献立を設定してください</p>
        </div>
      )}
    </div>
  )
}
