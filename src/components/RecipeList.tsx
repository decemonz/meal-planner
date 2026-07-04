import { useState } from 'react'
import type { Recipe, MealType } from '../types'

interface Props {
  recipes: Recipe[]
  onAdd: (recipe: Omit<Recipe, 'id'>) => void
  onUpdate: (recipe: Recipe) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  onToggleActive: (id: string) => void
}

export function RecipeList({ recipes, onAdd, onUpdate, onDelete, onToggleFavorite, onToggleActive }: Props) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [days, setDays] = useState(1)
  const [mealTypes, setMealTypes] = useState<MealType[]>(['朝食', '昼食', '夕食'])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null)

  const resetForm = () => {
    setName('')
    setCategory('')
    setIngredients('')
    setDays(1)
    setMealTypes(['朝食', '昼食', '夕食'])
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (r: Recipe) => {
    setName(r.name)
    setCategory(r.category)
    setIngredients(r.ingredients.join('、'))
    setDays(r.days)
    setMealTypes(r.mealTypes ?? ['朝食', '昼食', '夕食'])
    setEditingId(r.id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const data = {
      name: name.trim(),
      category: category.trim() || 'その他',
      ingredients: ingredients.split(/[,、]/).map(s => s.trim()).filter(Boolean),
      days,
      mealTypes,
    }

    if (editingId) {
      const original = recipes.find(r => r.id === editingId)
      onUpdate({ ...data, id: editingId, favorite: original?.favorite ?? false, active: original?.active ?? true })
    } else {
      onAdd(data)
    }
    resetForm()
  }

  return (
    <div className="recipe-section">
      <div className="section-header">
        <h2>レシピ一覧</h2>
        {!showForm && (
          <button className="btn" onClick={() => setShowForm(true)}>追加</button>
        )}
      </div>

      {showForm && (
        <form className="recipe-form" onSubmit={handleSubmit}>
          <div className="form-title-row">
            <span className="form-title">{editingId ? 'レシピ編集' : '新規レシピ'}</span>
            <button type="button" className="btn" onClick={resetForm}>キャンセル</button>
          </div>
          <input
            type="text"
            placeholder="レシピ名"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">カテゴリを選択</option>
            <option value="和食">和食</option>
            <option value="洋食">洋食</option>
            <option value="中華">中華</option>
            <option value="韓国">韓国</option>
            <option value="エスニック">エスニック</option>
            <option value="イタリアン">イタリアン</option>
            <option value="フレンチ">フレンチ</option>
            <option value="カレー">カレー</option>
            <option value="麺類">麺類</option>
            <option value="丼もの">丼もの</option>
            <option value="サラダ">サラダ</option>
            <option value="スープ">スープ</option>
            <option value="デザート">デザート</option>
            <option value="その他">その他</option>
          </select>
          <div className="days-row">
            <label>日持ち</label>
            <select value={days} onChange={e => setDays(Number(e.target.value))}>
              {[1, 2, 3, 4].map(d => (
                <option key={d} value={d}>{d}日</option>
              ))}
            </select>
          </div>
          <div className="meal-types-row">
            <label>対応食事</label>
            <div className="meal-type-chips">
              {(['朝食', '昼食', '夕食'] as const).map(m => (
                <label key={m} className={`chip${mealTypes.includes(m) ? ' active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={mealTypes.includes(m)}
                    onChange={() => setMealTypes(prev =>
                      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
                    )}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>
          <textarea
            placeholder="材料（カンマor読点区切り）"
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            rows={3}
          />
          <button type="submit" className="btn primary">
            {editingId ? '更新' : '保存'}
          </button>
        </form>
      )}

      {recipes.length > 0 && (
        <>
          <div className="filter-row">
            <div className="category-filter">
              <button
                className={`cat-chip${!selectedCategory ? ' active' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >すべて</button>
              {[...new Set(recipes.map(r => r.category))].map(c => (
                <button
                  key={c}
                  className={`cat-chip${selectedCategory === c ? ' active' : ''}`}
                  onClick={() => setSelectedCategory(c)}
                >{c}</button>
              ))}
            </div>
            <div className="category-filter">
              <button
                className={`cat-chip${!selectedMealType ? ' active' : ''}`}
                onClick={() => setSelectedMealType(null)}
              >すべて</button>
              {(['朝食', '昼食', '夕食'] as const).map(m => (
                <button
                  key={m}
                  className={`cat-chip${selectedMealType === m ? ' active' : ''}`}
                  onClick={() => setSelectedMealType(m)}
                >{m}</button>
              ))}
            </div>
          </div>
        </>
      )}

      {recipes.length === 0 ? (
        <p className="empty">レシピが登録されていません</p>
      ) : (
        <ul className="recipe-list">
          {recipes
            .filter(r => !selectedCategory || r.category === selectedCategory)
            .filter(r => !selectedMealType || (r.mealTypes ?? ['朝食', '昼食', '夕食']).includes(selectedMealType))
            .map(r => (
            <li key={r.id} className="recipe-card">
              <div className="recipe-info">
                <strong>{r.name}</strong>
                <span className="category-badge">{r.category}</span>
                {r.days > 1 && <span className="days-badge">{r.days}日</span>}
                {(r.mealTypes ?? ['朝食', '昼食', '夕食']).map(m => (
                  <span key={m} className={`meal-badge meal-${m}`}>{m}</span>
                ))}
              </div>
              {r.ingredients.length > 0 && (
                <p className="ingredients">{r.ingredients.join('、')}</p>
              )}
              <button
                className={`btn active-toggle${(r.active ?? true) ? '' : ' inactive'}`}
                onClick={() => onToggleActive(r.id)}
                title={(r.active ?? true) ? '無効にする' : '有効にする'}
              >
                {(r.active ?? true) ? '有効' : '無効'}
              </button>
              <button className="btn edit" onClick={() => startEdit(r)}>
                編集
              </button>
              <button
                className={`btn star${r.favorite ? ' active' : ''}`}
                onClick={() => onToggleFavorite(r.id)}
                title={r.favorite ? 'お気に入り解除' : 'お気に入り'}
              >
                {r.favorite ? '★' : '☆'}
              </button>
              <button className="btn del" onClick={() => onDelete(r.id)}>
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
