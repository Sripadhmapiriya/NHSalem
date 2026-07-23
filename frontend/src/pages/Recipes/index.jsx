import { useState, useEffect, useMemo, memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Chip from '@/components/ui/Chip'
import { RecipeCardSkeleton } from '@/components/ui/Skeleton'
import { getRecipes } from '@/services/api'
import useDebounce from '@/hooks/useDebounce'
import useAdminAuthStore from '@/store/adminAuthStore'

/**
 * AdminReturnBanner — shown at the top of public recipe pages when an admin
 * is currently logged in. The admin session is stored in localStorage
 * (adminAuthStore) and remains valid — no re-login is required when
 * returning to /admin/recipes after viewing a recipe on the public site.
 */
function AdminReturnBanner() {
  const admin = useAdminAuthStore((s) => s.admin)
  if (!admin) return null
  return (
    <div
      className="fixed top-0 inset-x-0 z-[100] flex items-center justify-between gap-3 px-4 py-2.5"
      style={{ background: '#0B1E3D' }}
    >
      <div className="flex items-center gap-2 text-white text-[12px] font-semibold">
        <span className="material-symbols-outlined text-yellow-400" style={{ fontSize: '16px' }}>admin_panel_settings</span>
        You are previewing as admin: <span className="text-yellow-400">{admin.name}</span>
      </div>
      <a
        href="/admin/recipes"
        className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white border border-white/30 hover:bg-white/10 transition-colors"
      >
        ← Return to Admin
      </a>
    </div>
  )
}

const RECIPE_CATEGORIES = ['All Recipes', 'Coastal Classics', 'Curries', 'Grills', 'Quick Meals']

const MemoRecipeCard = memo(function RecipeCard({ recipe }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-[28px] shadow-card overflow-hidden group"
      aria-label={recipe.title}
    >
      <Link to={`/recipes/${recipe.slug}`}>
        <div className="relative overflow-hidden aspect-[3/2]">
          <img
            src={recipe.image}
            alt={recipe.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[2500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
          />
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-lg text-label-sm font-semibold">
              {recipe.category}
            </span>
          </div>
          <div className="absolute bottom-3 right-3 flex gap-2">
            <span className="px-2.5 py-1 bg-black/60 text-white rounded-lg text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }} aria-hidden="true">schedule</span>
              {recipe.time}
            </span>
            <span className="px-2.5 py-1 bg-black/60 text-white rounded-lg text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }} aria-hidden="true">people</span>
              {recipe.servings}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-5">
        <Link to={`/recipes/${recipe.slug}`}>
          <h2 className="text-headline-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {recipe.title}
          </h2>
        </Link>
        <p className="text-body-md text-on-surface-variant line-clamp-2 mb-4">
          {recipe.description}
        </p>
        <div className="flex items-center justify-between">
          <span className={`text-label-sm font-semibold px-2.5 py-1 rounded-lg ${
            recipe.difficulty === 'Easy' ? 'bg-success/10 text-success' :
            recipe.difficulty === 'Medium' ? 'bg-secondary-container/30 text-secondary' :
            'bg-on-tertiary-container/10 text-on-tertiary-container'
          }`}>
            {recipe.difficulty}
          </span>
          <Link
            to={`/recipes/${recipe.slug}`}
            className="flex items-center gap-1.5 text-label-md text-primary font-semibold hover:underline"
          >
            View Recipe
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">arrow_forward</span>
          </Link>
        </div>
      </div>
    </motion.article>
  )
})

export default function Recipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All Recipes')

  useEffect(() => {
    const cat = activeCategory === 'All Recipes' ? undefined : activeCategory
    setLoading(true)
    getRecipes({ category: cat }).then((data) => {
      setRecipes(data)
      setLoading(false)
    })
  }, [activeCategory])

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="py-16 bg-primary text-white text-center" aria-labelledby="recipes-heading">
        <div className="container-max">
          <p className="text-label-md text-secondary-container font-semibold tracking-widest uppercase mb-3">
            From Our Kitchen
          </p>
          <h1 id="recipes-heading" className="text-display-lg-mobile md:text-display-lg mb-4">
            Maritime Culinary Arts
          </h1>
          <p className="text-body-lg text-white/70 max-w-xl mx-auto">
            Chef-crafted recipes that bring out the best in our premium seafood — from simple weeknight fries to showstopping paellas.
          </p>
        </div>
      </section>

      {/* Filter pills */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-outline-variant/30 py-4">
        <div className="container-max">
          <div className="flex gap-2 overflow-x-auto carousel-scroll pb-1">
            {RECIPE_CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0"
              >
                {cat}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container-max py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-live="polite">
            {recipes.map((recipe) => (
              <MemoRecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-headline-sm text-on-surface-variant">No recipes in this category yet.</p>
          </div>
        )}
      </div>
    </div>
    <AdminReturnBanner />
  )
}
