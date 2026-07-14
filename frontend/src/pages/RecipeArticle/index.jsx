import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { PageSkeleton } from '@/components/ui/Skeleton'
import useCartStore from '@/store/cartStore'
import useToastStore from '@/store/toastStore'
import useAuthStore from '@/store/authStore'
import { getRecipeBySlug, getProductById } from '@/services/api'
import useAdminAuthStore from '@/store/adminAuthStore'

/**
 * AdminReturnBanner — shown when an admin previews this public recipe page.
 * The admin session token lives in localStorage (adminAuthStore), so the
 * admin can return to /admin/recipes via the banner WITHOUT re-logging in.
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
        Previewing as admin: <span className="text-yellow-400">{admin.name}</span>
      </div>
      <a
        href="/admin/recipes"
        className="px-3 py-1.5 rounded-full text-[11px] font-bold text-white border border-white/30 hover:bg-white/10 transition-colors"
      >
        ← Return to Admin
      </a>
    </div>
  )
}

export default function RecipeArticle() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shopProducts, setShopProducts] = useState([])
  const [checkedSteps, setCheckedSteps] = useState([])
  const { addItem } = useCartStore()
  const { addToast } = useToastStore()

  useEffect(() => {
    setLoading(true)
    getRecipeBySlug(slug).then(async (r) => {
      setRecipe(r)
      if (r?.shopIngredients?.length) {
        const products = await Promise.all(r.shopIngredients.map((id) => getProductById(id)))
        setShopProducts(products.filter(Boolean))
      }
      setLoading(false)
    })
  }, [slug])

  const toggleStep = (i) => {
    setCheckedSteps((prev) =>
      prev.includes(i) ? prev.filter((s) => s !== i) : [...prev, i]
    )
  }

  if (loading) return <PageSkeleton />
  if (!recipe) return (
    <div className="container-max py-32 text-center">
      <h1 className="text-display-lg-mobile">Recipe Not Found</h1>
      <Button variant="primary" className="mt-6" onClick={() => navigate('/recipes')}>Back to Recipes</Button>
    </div>
  )

  return (
    <div className="bg-background min-h-screen">
      {/* Hero image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container-max pb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-label-sm text-white/60 mb-3">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/recipes" className="hover:text-white transition-colors">Recipes</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/90">{recipe.title}</span>
          </nav>
          <h1 className="text-display-lg-mobile md:text-4xl font-bold text-white">{recipe.title}</h1>
        </div>
      </div>

      <div className="container-max py-10">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Meta */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: 'schedule', label: recipe.time },
                { icon: 'people', label: `${recipe.servings} servings` },
                { icon: 'bar_chart', label: recipe.difficulty },
                { icon: 'restaurant', label: recipe.category },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-2 text-label-md text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }} aria-hidden="true">{m.icon}</span>
                  {m.label}
                </div>
              ))}
            </div>

            <p className="text-body-lg text-on-surface-variant leading-relaxed">{recipe.description}</p>

            {/* Ingredients */}
            <section aria-labelledby="ingredients-heading">
              <h2 id="ingredients-heading" className="text-headline-md text-on-surface mb-4">Ingredients</h2>
              <ul className="space-y-2" role="list">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-secondary-container rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                      <span className="material-symbols-outlined text-on-secondary-container filled" style={{ fontSize: '12px' }}>check</span>
                    </span>
                    <span className="text-body-md text-on-surface">{ing}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Steps */}
            <section aria-labelledby="steps-heading">
              <h2 id="steps-heading" className="text-headline-md text-on-surface mb-4">How to Cook</h2>
              <ol className="space-y-4" role="list">
                {recipe.steps.map((step, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    className={`flex items-start gap-4 p-4 rounded-[16px] transition-colors cursor-pointer ${
                      checkedSteps.includes(i) ? 'bg-success/5 border border-success/20' : 'bg-surface-container-low hover:bg-surface-container'
                    }`}
                    onClick={() => toggleStep(i)}
                    role="listitem"
                  >
                    <button
                      aria-label={checkedSteps.includes(i) ? `Mark step ${i + 1} as incomplete` : `Mark step ${i + 1} as complete`}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm border-2 transition-all ${
                        checkedSteps.includes(i)
                          ? 'bg-success border-success text-on-success'
                          : 'border-outline-variant text-on-surface-variant'
                      }`}
                    >
                      {checkedSteps.includes(i) ? (
                        <span className="material-symbols-outlined filled" style={{ fontSize: '16px' }} aria-hidden="true">check</span>
                      ) : (
                        i + 1
                      )}
                    </button>
                    <p className={`text-body-md leading-relaxed flex-1 ${checkedSteps.includes(i) ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                      {step}
                    </p>
                  </motion.li>
                ))}
              </ol>
            </section>

            {/* Chef's Tip */}
            {recipe.chefTip && (
              <div className="bg-secondary-container/15 border border-secondary-container/30 rounded-[20px] p-6 flex gap-4">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: '28px' }} aria-hidden="true">tips_and_updates</span>
                <div>
                  <p className="text-label-md font-bold text-secondary mb-1">Chef's Tip</p>
                  <p className="text-body-md text-on-surface-variant">{recipe.chefTip}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Shop ingredients */}
          <div>
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-[28px] shadow-card p-6">
                <h2 className="text-headline-sm text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }} aria-hidden="true">shopping_cart</span>
                  Shop Ingredients
                </h2>
                {shopProducts.length > 0 ? (
                  <div className="space-y-4">
                    {shopProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-14 h-14 rounded-[10px] object-cover flex-shrink-0" loading="lazy" />
                        <div className="flex-1 min-w-0">
                          <p className="text-label-md font-semibold text-on-surface truncate">{product.name}</p>
                          <p className="text-label-sm text-on-surface-variant">from ₹{product.basePrice?.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => {
                            const { user, setCartLoginPopupOpen, setPendingAction } = useAuthStore.getState()
                            if (!user) {
                              setPendingAction({
                                type: 'ADD_TO_CART',
                                payload: {
                                  id: product.id,
                                  name: product.name,
                                  image: product.image,
                                  weight: product.weights?.[0]?.label || '500g',
                                  price: product.basePrice,
                                  quantity: 1,
                                }
                              })
                              setCartLoginPopupOpen(true)
                              return
                            }
                            addItem({ id: product.id, name: product.name, image: product.image, weight: product.weights?.[0]?.label || '500g', price: product.basePrice, quantity: 1 })
                            addToast({ message: `${product.name} added to cart!`, type: 'success' })
                          }}
                          aria-label={`Add ${product.name} to cart`}
                          className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0 hover:bg-primary-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '18px' }} aria-hidden="true">add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-body-md text-on-surface-variant">Check out our full range of fresh seafood!</p>
                )}
                <Button variant="primary" className="w-full mt-5" onClick={() => navigate('/category/fish')}>
                  Browse All Seafood
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AdminReturnBanner />
  )
}
