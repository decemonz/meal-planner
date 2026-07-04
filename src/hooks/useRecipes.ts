import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Recipe } from '../types'

export function useRecipes() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('recipes', [])

  const addRecipe = useCallback((recipe: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = { ...recipe, id: crypto.randomUUID(), favorite: false, active: true }
    setRecipes(prev => [...prev, newRecipe])
    return newRecipe
  }, [setRecipes])

  const deleteRecipe = useCallback((id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id))
  }, [setRecipes])

  const toggleFavorite = useCallback((id: string) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, favorite: !r.favorite } : r))
  }, [setRecipes])

  const toggleActive = useCallback((id: string) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, active: !(r.active ?? true) } : r))
  }, [setRecipes])

  const updateRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r))
  }, [setRecipes])

  return { recipes, addRecipe, deleteRecipe, toggleFavorite, toggleActive, updateRecipe }
}
