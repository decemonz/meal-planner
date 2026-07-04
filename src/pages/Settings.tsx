import { useState } from 'react'
import type { Recipe, MealVisibility, MealType } from '../types'

interface Props {
  recipes: Recipe[]
  mealVisibility: MealVisibility
  onToggleMeal: (meal: MealType) => void
  homeDefaultWeek: 'current' | 'next'
  onChangeHomeDefault: (val: 'current' | 'next') => void
}

export function Settings({ recipes, mealVisibility, onToggleMeal, homeDefaultWeek, onChangeHomeDefault }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClearAll = () => {
    localStorage.clear()
    window.location.reload()
  }

  const handleExport = () => {
    const data = JSON.stringify(localStorage, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meal-planner-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string)
          for (const key of Object.keys(data)) {
            localStorage.setItem(key, data[key])
          }
          window.location.reload()
        } catch {
          alert('ファイルが正しくありません')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const meals: { key: MealType; label: string; emoji: string }[] = [
    { key: '朝食', label: '朝食', emoji: '🌅' },
    { key: '昼食', label: '昼食', emoji: '☀️' },
    { key: '夕食', label: '夕食', emoji: '🌙' },
  ]

  return (
    <div className="settings-page">
      <h2>設定</h2>

      <div className="settings-group">
        <h3>表示設定</h3>
        <div className="toggle-list">
          {meals.map(m => (
            <label key={m.key} className="toggle-row">
              <span>{m.emoji} {m.label}</span>
              <input
                type="checkbox"
                className="toggle"
                checked={mealVisibility[m.key]}
                onChange={() => onToggleMeal(m.key)}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <h3>ホーム初期表示</h3>
        <div className="home-week-toggle">
          <button
            className={`chip${homeDefaultWeek === 'current' ? ' active' : ''}`}
            onClick={() => onChangeHomeDefault('current')}
          >今週</button>
          <button
            className={`chip${homeDefaultWeek === 'next' ? ' active' : ''}`}
            onClick={() => onChangeHomeDefault('next')}
          >次週</button>
        </div>
      </div>

      <div className="settings-group">
        <h3>データ管理</h3>
        <div className="settings-actions">
          <button className="btn" onClick={handleExport}>エクスポート</button>
          <button className="btn" onClick={handleImport}>インポート</button>
          <button className="btn del" onClick={() => setShowConfirm(true)}>
            全消去
          </button>
        </div>
        {showConfirm && (
          <div className="confirm-box">
            <p>本当にすべてのデータを消去しますか？</p>
            <div className="confirm-actions">
              <button className="btn" onClick={() => setShowConfirm(false)}>キャンセル</button>
              <button className="btn primary" onClick={handleClearAll}>実行</button>
            </div>
          </div>
        )}
      </div>

      <div className="settings-group">
        <h3>レシピ数</h3>
        <p className="settings-info">{recipes.length}件のレシピが登録されています</p>
      </div>

      <div className="settings-group">
        <h3>アプリ情報</h3>
        <p className="settings-info">献立管理 v1.0.0</p>
      </div>
    </div>
  )
}
