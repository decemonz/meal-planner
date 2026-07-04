import { useState, useCallback, useMemo, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { DayMenu, MealType, Recipe } from '../types'

function getWeekDates(weekOffset = 0): string[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`
}

export function weekLabel(weekDates: string[]): string {
  const start = weekDates[0]
  const end = weekDates[6]
  const d1 = new Date(start)
  const d2 = new Date(end)
  return `${d1.getMonth() + 1}/${d1.getDate()} - ${d2.getMonth() + 1}/${d2.getDate()}`
}

export function useWeeklyMenu() {
  const [weekOffset, setWeekOffset] = useState(0)

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])
  const currentWeekDates = useMemo(() => getWeekDates(0), [])
  const nextWeekDates = useMemo(() => getWeekDates(1), [])
  const weekStart = weekDates[0]

  const [days, setDays] = useLocalStorage<DayMenu[]>(`menu-${weekStart}`, [])
  const [currentWeekDays] = useLocalStorage<DayMenu[]>(`menu-${currentWeekDates[0]}`, [])
  const [nextWeekDays] = useLocalStorage<DayMenu[]>(`menu-${nextWeekDates[0]}`, [])

  useEffect(() => {
    const prefix = 'menu-'
    const cutoff = new Date(currentWeekDates[0]).getTime()
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) keys.push(key)
    }
    for (const key of keys) {
      const dateStr = key.slice(prefix.length)
      const d = new Date(dateStr)
      if (!isNaN(d.getTime()) && d.getTime() < cutoff) {
        localStorage.removeItem(key)
      }
    }
  }, [currentWeekDates])

  const goPrevWeek = useCallback(() => setWeekOffset(o => o - 1), [])
  const goNextWeek = useCallback(() => setWeekOffset(o => o + 1), [])
  const goCurrentWeek = useCallback(() => setWeekOffset(0), [])

  const randomizeWeek = useCallback((allRecipes: Recipe[], mealTypes: MealType[]) => {
    const defaultMT: MealType[] = ['朝食', '昼食', '夕食']
    const matching = allRecipes.filter(r => (r.mealTypes ?? defaultMT).some(m => mealTypes.includes(m)))
    if (matching.length === 0) return

    const span = new Map<string, string>()
    const usedThisWeek = new Set<string>()
    const newDays: DayMenu[] = []

    for (const date of weekDates) {
      const entries: { recipeId: string; mealType: MealType }[] = []

      for (const mealType of mealTypes) {
        const spanKey = `${date}-${mealType}`
        const spannedId = span.get(spanKey)
        if (spannedId) {
          entries.push({ recipeId: spannedId, mealType })
          continue
        }

        const usedToday = new Set(entries.map(e => e.recipeId))
        const available = matching.filter(r => {
          if (usedThisWeek.has(r.id)) return false
          if (usedToday.has(r.id)) return false
          if (!(r.mealTypes ?? defaultMT).includes(mealType)) return false
          return true
        })
        if (available.length === 0) continue

        const pick = available[Math.floor(Math.random() * available.length)]
        usedThisWeek.add(pick.id)
        entries.push({ recipeId: pick.id, mealType })

        const spanDays = Math.min(pick.days ?? 1, 7)
        for (let i = 1; i < spanDays; i++) {
          const d = new Date(date)
          d.setDate(d.getDate() + i)
          const nextDate = d.toISOString().slice(0, 10)
          span.set(`${nextDate}-${mealType}`, pick.id)
        }
      }

      if (entries.length > 0) {
        newDays.push({ date, entries })
      }
    }

    setDays(newDays)
  }, [weekDates, setDays])

  const setMeal = useCallback((date: string, mealType: MealType, recipeId: string | null) => {
    setDays(prev => {
      const dayIndex = prev.findIndex(d => d.date === date)
      if (dayIndex === -1) {
        if (!recipeId) return prev
        return [...prev, { date, entries: [{ recipeId, mealType }] }]
      }
      const newDays = structuredClone(prev)
      const day = newDays[dayIndex]
      const entryIndex = day.entries.findIndex(e => e.mealType === mealType)
      if (!recipeId) {
        if (entryIndex !== -1) {
          day.entries.splice(entryIndex, 1)
        }
      } else if (entryIndex === -1) {
        day.entries.push({ recipeId, mealType })
      } else {
        day.entries[entryIndex].recipeId = recipeId
      }
      if (day.entries.length === 0) {
        newDays.splice(dayIndex, 1)
      }
      return newDays
    })
  }, [setDays])

  return {
    weekOffset,
    weekDates,
    currentWeekDates,
    nextWeekDates,
    weekStart,
    days,
    currentWeekDays,
    nextWeekDays,
    setMeal,
    randomizeWeek,
    formatDate,
    goPrevWeek,
    goNextWeek,
    goCurrentWeek,
    weekLabel,
  }
}
