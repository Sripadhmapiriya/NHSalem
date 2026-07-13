import { create } from 'zustand'
import RECIPES from '@/mock/recipes'

/**
 * Recipe Store — in-memory (not persisted to localStorage).
 * Initialised from the static RECIPES mock array.
 *
 * In Phase 2: replace addRecipe / updateRecipe / deleteRecipe with
 * real API calls; component code stays the same.
 *
 * NOTE: The public /recipes and /recipes/:slug pages are intentionally
 * public (marketing content). The admin CMS at /admin/recipes is
 * protected by ProtectedAdminRoute — only authenticated admins can edit.
 * When an admin visits the public pages via the "View" button, a
 * "Return to Admin" banner is shown (checked via adminAuthStore in localStorage).
 */
const useRecipeStore = create((set, get) => ({
  recipes: [...RECIPES],

  /** Add a new recipe. Returns the created recipe. */
  addRecipe: (data) => {
    const newRecipe = {
      ...data,
      id: data.slug || `recipe-${Date.now()}`,
      slug: data.slug || data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      tags: data.tags ?? [],
      ingredients: data.ingredients ?? [],
      steps: data.steps ?? [],
    }
    set((state) => ({ recipes: [newRecipe, ...state.recipes] }))
    return newRecipe
  },

  /** Update an existing recipe by id. */
  updateRecipe: (id, data) => {
    set((state) => ({
      recipes: state.recipes.map((r) => (r.id === id ? { ...r, ...data } : r)),
    }))
  },

  /** Delete a recipe by id. */
  deleteRecipe: (id) => {
    set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }))
  },

  /** Get a single recipe by id. */
  getRecipe: (id) => get().recipes.find((r) => r.id === id),
}))

export default useRecipeStore
