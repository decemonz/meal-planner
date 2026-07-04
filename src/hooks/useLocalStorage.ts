import { useState, useRef, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const keyRef = useRef(key)
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key
      try {
        const item = localStorage.getItem(key)
        setStoredValue(item ? (JSON.parse(item) as T) : initialValue)
      } catch {
        setStoredValue(initialValue)
      }
    }
  }, [key, initialValue])

  const setValue = (value: T | ((val: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value
      localStorage.setItem(key, JSON.stringify(valueToStore))
      return valueToStore
    })
  }

  return [storedValue, setValue] as const
}
