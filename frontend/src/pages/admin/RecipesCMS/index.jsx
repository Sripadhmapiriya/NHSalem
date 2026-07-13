import { useState } from 'react'
import useRecipeStore from '@/store/recipeStore'
import useToastStore from '@/store/toastStore'
import { AdminPage, AdminCard, AdminTable, Tr, Td, AdminBtn, AdminInput } from '@/admin/AdminUI'

const CATEGORIES = ['Coastal Classics', 'Curries', 'Grills', 'Quick Meals', 'Salads', 'Soups']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

// ── Recipe Form Modal ─────────────────────────────────────────────────────────
function RecipeFormModal({ initial, onClose, onSave }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState(initial?.category ?? 'Coastal Classics')
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? 'Easy')
  const [time, setTime] = useState(initial?.time ?? '')
  const [servings, setServings] = useState(initial?.servings ?? 2)
  const [image, setImage] = useState(initial?.image ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '))
  const [ingredients, setIngredients] = useState((initial?.ingredients ?? []).join('\n'))
  const [steps, setSteps] = useState((initial?.steps ?? []).join('\n'))
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!title.trim()) errs.title = 'Title is required.'
    if (!description.trim()) errs.description = 'Description is required.'
    if (!time.trim()) errs.time = 'Cook time is required.'
    return errs
  }

  const handleSave = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    setTimeout(() => {
      onSave({
        title: title.trim(),
        category,
        difficulty,
        time: time.trim(),
        servings: Number(servings),
        image: image.trim() || null,
        description: description.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        ingredients: ingredients.split('\n').map((l) => l.trim()).filter(Boolean),
        steps: steps.split('\n').map((l) => l.trim()).filter(Boolean),
      })
      setSaving(false)
    }, 700)
  }

  const inputClass = (field) =>
    `w-full px-3 py-2 rounded-[10px] border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none focus:border-admin-navy ${errors[field] ? 'border-red-400' : 'border-admin-border'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6" onClick={onClose}>
      <div
        className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.2)] w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-admin-border/40 px-6 py-4 flex items-center justify-between rounded-t-[20px]">
          <h2 className="text-[15px] font-bold text-admin-navy">
            {initial ? `Edit — ${initial.title}` : 'New Recipe'}
          </h2>
          <button onClick={onClose} className="text-admin-text-sub hover:text-admin-navy">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
              Title <span className="text-admin-coral">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })) }}
              placeholder="e.g. Garlic Butter Tiger Prawns"
              className={inputClass('title')}
            />
            {errors.title && <p className="text-[11px] text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            {/* Difficulty */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none">
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            {/* Cook Time */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                Cook Time <span className="text-admin-coral">*</span>
              </label>
              <input
                value={time}
                onChange={(e) => { setTime(e.target.value); setErrors((p) => ({ ...p, time: '' })) }}
                placeholder="e.g. 30 min"
                className={inputClass('time')}
              />
              {errors.time && <p className="text-[11px] text-red-600 mt-1">{errors.time}</p>}
            </div>
            {/* Servings */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Servings</label>
              <input type="number" min={1} value={servings} onChange={(e) => setServings(e.target.value)} className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none" />
            </div>
            {/* Tags */}
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Tags (comma-separated)</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Quick Meals, Grills, etc." className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none" />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Image URL</label>
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
              Description <span className="text-admin-coral">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })) }}
              placeholder="Brief recipe description…"
              className={`${inputClass('description')} resize-none`}
            />
            {errors.description && <p className="text-[11px] text-red-600 mt-1">{errors.description}</p>}
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
              Ingredients <span className="text-[10px] font-normal text-admin-text-sub normal-case">(one per line)</span>
            </label>
            <textarea
              rows={5}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder={"500g Tiger Prawns\n4 tbsp Butter\n5 Garlic cloves"}
              className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none resize-none font-mono"
            />
          </div>

          {/* Steps */}
          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
              Steps <span className="text-[10px] font-normal text-admin-text-sub normal-case">(one per line)</span>
            </label>
            <textarea
              rows={5}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder={"Pat prawns dry and season\nHeat butter in skillet…"}
              className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none resize-none font-mono"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-admin-border/40 px-6 py-4 flex gap-2 justify-end rounded-b-[20px]">
          <AdminBtn variant="secondary" onClick={onClose}>Cancel</AdminBtn>
          <AdminBtn variant="primary" icon={saving ? 'sync' : 'save'} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Update Recipe' : 'Create Recipe'}
          </AdminBtn>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminRecipesCMS() {
  const { addToast } = useToastStore()
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipeStore()
  const [search, setSearch] = useState('')
  const [modalState, setModalState] = useState(null) // null | { mode: 'create' } | { mode: 'edit', recipe }

  const filtered = recipes.filter(
    (r) =>
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => setModalState({ mode: 'create' })
  const handleEdit = (recipe) => setModalState({ mode: 'edit', recipe })
  const handleClose = () => setModalState(null)

  const handleSave = (data) => {
    if (modalState.mode === 'edit') {
      updateRecipe(modalState.recipe.id, data)
      addToast({ message: `"${data.title}" updated successfully.`, type: 'success' })
    } else {
      addRecipe(data)
      addToast({ message: `"${data.title}" created and added to the CMS.`, type: 'success' })
    }
    setModalState(null)
  }

  const handleDelete = (recipe) => {
    if (!window.confirm(`Delete recipe "${recipe.title}"? This cannot be undone.`)) return
    deleteRecipe(recipe.id)
    addToast({ message: `"${recipe.title}" deleted.`, type: 'info' })
  }

  return (
    <AdminPage>
      {/* Recipe Form Modal */}
      {modalState && (
        <RecipeFormModal
          initial={modalState.mode === 'edit' ? modalState.recipe : null}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <AdminInput
          id="recipes-search"
          placeholder="Search recipe or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon="search"
          className="w-64"
        />
        <AdminBtn icon="add" onClick={handleCreate}>New Recipe</AdminBtn>
      </div>

      <AdminCard subtitle={`${filtered.length} recipe${filtered.length !== 1 ? 's' : ''}`}>
        <AdminTable headers={['', 'Title', 'Category', 'Tags', 'Time', 'Difficulty', 'Actions']}>
          {filtered.map((r) => (
            <Tr key={r.id}>
              {/* Thumbnail */}
              <Td>
                {r.image
                  ? <img src={r.image} alt={r.title} className="w-14 h-10 rounded-[8px] object-cover border border-admin-border/50" />
                  : <div className="w-14 h-10 rounded-[8px] bg-admin-seafoam border border-admin-border/50 flex items-center justify-center"><span className="material-symbols-outlined text-admin-text-sub" style={{ fontSize: '18px' }}>menu_book</span></div>
                }
              </Td>
              {/* Title */}
              <Td>
                <p className="font-semibold text-admin-navy max-w-[200px] truncate">{r.title}</p>
                <p className="text-[11px] text-admin-text-sub truncate max-w-[200px]">{r.description?.slice(0, 60)}…</p>
              </Td>
              <Td>{r.category}</Td>
              {/* Tags */}
              <Td>
                <div className="flex flex-wrap gap-1">
                  {r.tags?.slice(0, 2).map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-admin-seafoam border border-admin-border rounded-full text-[10px] font-medium text-admin-text-sub">{t}</span>
                  ))}
                </div>
              </Td>
              <Td>{r.time}</Td>
              {/* Difficulty */}
              <Td>
                <span className={`text-[11px] font-semibold ${r.difficulty === 'Easy' ? 'text-admin-success' : r.difficulty === 'Hard' ? 'text-admin-coral' : 'text-admin-gold'}`}>
                  {r.difficulty}
                </span>
              </Td>
              {/* Actions — all wired */}
              <Td>
                <div className="flex gap-1">
                  <AdminBtn size="sm" variant="secondary" icon="edit" onClick={() => handleEdit(r)}>
                    Edit
                  </AdminBtn>
                  {/*
                    "View" opens the public recipe page in a new tab.
                    The admin session is preserved in localStorage (adminAuthStore),
                    so no re-login is required when returning to /admin/recipes.
                    A "Return to Admin" banner is shown on the public pages when an
                    admin token is detected in localStorage.
                  */}
                  <AdminBtn
                    size="sm"
                    variant="secondary"
                    icon="open_in_new"
                    onClick={() => window.open(`/recipes/${r.slug}`, '_blank')}
                  >
                    View
                  </AdminBtn>
                  <AdminBtn size="sm" variant="danger" icon="delete" onClick={() => handleDelete(r)}>
                    Delete
                  </AdminBtn>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      </AdminCard>
    </AdminPage>
  )
}
