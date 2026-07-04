import { useState } from 'react'
import { useRecipes } from './hooks/useRecipes'
import { useWeeklyMenu, weekLabel } from './hooks/useWeeklyMenu'
import { useMealVisibility, useMealTypes } from './hooks/useMealVisibility'
import { useLocalStorage } from './hooks/useLocalStorage'
import { RecipeList } from './components/RecipeList'
import { WeeklyMenu } from './components/WeeklyMenu'
import { ShoppingList } from './components/ShoppingList'
import { Home } from './pages/Home'
import { Settings } from './pages/Settings'
import './App.css'

type Tab = 'home' | 'recipes' | 'calendar' | 'settings'

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'ホーム', icon: '🏠' },
  { key: 'recipes', label: 'レシピ', icon: '🍳' },
  { key: 'calendar', label: 'カレンダー', icon: '📅' },
  { key: 'settings', label: '設定', icon: '⚙️' },
]

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const { recipes, addRecipe, deleteRecipe, toggleFavorite, toggleActive, updateRecipe } = useRecipes()
  const { weekDates, currentWeekDates, nextWeekDates, days, currentWeekDays, nextWeekDays, setMeal, randomizeWeek, formatDate, goPrevWeek, goNextWeek } = useWeeklyMenu()
  const [mealVisibility, setMealVisibility] = useMealVisibility()
  const visibleMealTypes = useMealTypes(mealVisibility)
  const [homeDefaultWeek, setHomeDefaultWeek] = useLocalStorage<'current' | 'next'>('homeDefaultWeek', 'current')

  const onToggleMeal = (meal: '朝食' | '昼食' | '夕食') => {
    setMealVisibility(prev => ({ ...prev, [meal]: !prev[meal] }))
  }

  const label = weekLabel(weekDates)
  const activeRecipes = recipes.filter(r => r.active ?? true)

  return (
    <div className="app">
      <header>
        <h1>献立管理</h1>
      </header>

      <main>
        {tab === 'home' && (
          <Home
            recipes={activeRecipes}
            currentDays={currentWeekDays}
            nextDays={nextWeekDays}
            currentDates={currentWeekDates}
            nextDates={nextWeekDates}
            defaultWeek={homeDefaultWeek}
            formatDate={formatDate}
          />
        )}
        {tab === 'recipes' && (
          <RecipeList
            recipes={recipes}
            onAdd={addRecipe}
            onUpdate={updateRecipe}
            onDelete={deleteRecipe}
            onToggleFavorite={toggleFavorite}
            onToggleActive={toggleActive}
          />
        )}
        {tab === 'calendar' && (
          <>
            <WeeklyMenu
              weekDates={weekDates}
              weekLabel={label}
              days={days}
              recipes={recipes}
              activeRecipes={activeRecipes}
              visibleMealTypes={visibleMealTypes}
              formatDate={formatDate}
              onSetMeal={setMeal}
              onPrevWeek={goPrevWeek}
              onNextWeek={goNextWeek}
              onRandomize={() => randomizeWeek(activeRecipes, visibleMealTypes)}
            />
            <ShoppingList days={days} recipes={recipes} />
          </>
        )}
        {tab === 'settings' && (
          <Settings
            recipes={activeRecipes}
            mealVisibility={mealVisibility}
            onToggleMeal={onToggleMeal}
            homeDefaultWeek={homeDefaultWeek}
            onChangeHomeDefault={setHomeDefaultWeek}
          />
        )}
      </main>

      <nav className="bottom-nav">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`nav-btn${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
