import { useState, useEffect } from 'react'
import { ADMIN_SUBSCRIPTIONS, ADMIN_CUSTOMERS } from '@/mock/adminData'
import useToastStore from '@/store/toastStore'
import useSubscriptionPlanStore from '@/store/subscriptionPlanStore'
import { SeafoodLoader } from '@/components/ui'
import {
  AdminPage,
  AdminCard,
  AdminTable,
  Tr,
  Td,
  StatusBadge,
  AdminBtn,
  AdminInput,
  FilterBar,
  formatCurrency,
  formatDate,
} from '@/admin/AdminUI'

// ── Change Plan Modal ─────────────────────────────────────────────────────────
function ChangePlanModal({ sub, onClose, onConfirm, plans }) {
  const [selectedPlanId, setSelectedPlanId] = useState(
    plans.find((p) => p.name === sub.plan)?.id || plans[0]?.id
  )

  const selectedPlanObj = plans.find((p) => p.id === selectedPlanId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-bold text-admin-navy">Change Plan</h3>
            <p className="text-[11px] text-admin-text-sub">{sub.customer}</p>
          </div>
          <button onClick={onClose} className="text-admin-text-sub hover:text-admin-navy">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <p className="text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-2">
          Current Plan
        </p>
        <div className="bg-admin-seafoam rounded-[10px] px-3 py-2 mb-4 text-[13px] font-semibold text-admin-navy">
          {sub.plan} — {formatCurrency(sub.amount)}/wk
        </div>

        <p className="text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-2">
          New Plan
        </p>
        <div className="space-y-2 mb-5">
          {plans.map((plan) => (
            <label
              key={plan.id}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-[10px] border cursor-pointer transition-all ${
                selectedPlanId === plan.id
                  ? 'border-admin-navy bg-admin-navy/5'
                  : 'border-admin-border hover:border-admin-navy/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={selectedPlanId === plan.id}
                  onChange={() => setSelectedPlanId(plan.id)}
                  className="accent-admin-navy"
                />
                <span className="text-[13px] font-semibold text-admin-navy">{plan.name}</span>
              </div>
              <span className="text-[12px] font-bold text-admin-text-sub">{formatCurrency(plan.price)}/wk</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <AdminBtn variant="secondary" onClick={onClose} className="flex-1 justify-center">
            Cancel
          </AdminBtn>
          <AdminBtn
            variant="primary"
            onClick={() => onConfirm(selectedPlanObj.name, selectedPlanObj.price)}
            disabled={!selectedPlanObj || selectedPlanObj.name === sub.plan}
            className="flex-1 justify-center"
          >
            Confirm Change
          </AdminBtn>
        </div>
      </div>
    </div>
  )
}

// ── Plan Form Modal ───────────────────────────────────────────────────────────
function PlanFormModal({ plan, onClose, onSubmit }) {
  const isEdit = !!plan

  const [name, setName] = useState(plan?.name || '')
  const [tagline, setTagline] = useState(plan?.tagline || '')
  const [price, setPrice] = useState(plan?.price || '')
  const [period, setPeriod] = useState(plan?.period || 'week')
  const [status, setStatus] = useState(plan?.status || 'active')
  const [highlights, setHighlights] = useState(plan?.highlights || [])
  const [newHighlight, setNewHighlight] = useState('')

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()])
      setNewHighlight('')
    }
  }

  const handleRemoveHighlight = (idx) => {
    setHighlights(highlights.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name,
      tagline,
      price: Number(price),
      period,
      status,
      highlights,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-admin-navy">
            {isEdit ? 'Edit Subscription Plan' : 'Create New Plan'}
          </h3>
          <button onClick={onClose} className="text-admin-text-sub hover:text-admin-navy">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
              Plan Name <span className="text-admin-coral">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none focus:border-admin-navy"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                Price (₹) <span className="text-admin-coral">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                Billing Cycle
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none"
              >
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
              Features / Highlights
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddHighlight(); } }}
                placeholder="Add a feature..."
                className="flex-1 px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none"
              />
              <AdminBtn type="button" variant="secondary" onClick={handleAddHighlight}>Add</AdminBtn>
            </div>
            {highlights.length > 0 && (
              <ul className="space-y-1">
                {highlights.map((hl, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-admin-seafoam px-3 py-1.5 rounded-[8px] text-[12px]">
                    <span>{hl}</span>
                    <button type="button" onClick={() => handleRemoveHighlight(idx)} className="text-admin-coral hover:text-red-700">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <AdminBtn type="button" variant="secondary" onClick={onClose}>Cancel</AdminBtn>
            <AdminBtn type="submit" variant="primary">
              {isEdit ? 'Save Changes' : 'Create Plan'}
            </AdminBtn>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminSubscriptions() {
  const { addToast } = useToastStore()
  const { plans, fetchPlans, addPlan, updatePlan, loading } = useSubscriptionPlanStore()

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])
  
  const [activeTab, setActiveTab] = useState('subscriptions') // 'subscriptions' | 'plans'

  const [subscriptions, setSubscriptions] = useState(ADMIN_SUBSCRIPTIONS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // New Subscription form (for Customers)
  const [showSubForm, setShowSubForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Modals
  const [changePlanTarget, setChangePlanTarget] = useState(null)
  const [planFormTarget, setPlanFormTarget] = useState(null) // plan object | 'new' | null

  // New subscription form values
  const [formCustomerId, setFormCustomerId] = useState('')
  const [formPlanId, setFormPlanId] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formNextDelivery, setFormNextDelivery] = useState('')
  const [formStart, setFormStart] = useState('')
  const [formError, setFormError] = useState('')

  const filteredSubs = subscriptions.filter((s) => {
    const matchSearch =
      !search ||
      s.customer.toLowerCase().includes(search.toLowerCase()) ||
      s.plan.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const activeCount = subscriptions.filter((s) => s.status === 'active').length
  const mrr = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.amount * 4, 0)

  // ── Subscriptions Handlers ──────────────────────────────────────────────────
  const handleToggleStatus = (subId) => {
    setActionLoadingId(subId)
    setTimeout(() => {
      setSubscriptions((prev) =>
        prev.map((s) => {
          if (s.id === subId) {
            const nextStatus = s.status === 'active' ? 'paused' : 'active'
            return {
              ...s,
              status: nextStatus,
              nextDelivery: nextStatus === 'active' ? '2024-07-15' : null,
            }
          }
          return s
        })
      )
      setActionLoadingId(null)
    }, 600)
  }

  const handleConfirmPlanChange = (newPlanName, newAmount) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === changePlanTarget.id ? { ...s, plan: newPlanName, amount: newAmount } : s
      )
    )
    addToast({
      message: `Plan changed to "${newPlanName}" for ${changePlanTarget.customer}`,
      type: 'success',
    })
    setChangePlanTarget(null)
  }

  const handlePlanSelectChange = (planId) => {
    setFormPlanId(planId)
    const matched = plans.find((p) => p.id === planId)
    if (matched) setFormAmount(matched.price)
  }

  const handleNewSub = () => {
    setFormCustomerId('')
    if (plans.length > 0) {
      setFormPlanId(plans[0].id)
      setFormAmount(plans[0].price)
    }
    setFormNextDelivery('')
    setFormStart('')
    setFormError('')
    setShowSubForm(true)
  }

  const handleSubSubmit = (e) => {
    e.preventDefault()
    setFormError('')

    if (!formCustomerId || !formPlanId) {
      setFormError('Please select a customer and a plan.')
      return
    }

    const customer = ADMIN_CUSTOMERS.find((c) => c.id === formCustomerId)
    const planObj = plans.find((p) => p.id === formPlanId)
    if (!customer || !planObj) {
      setFormError('Invalid selection.')
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      const newSub = {
        id: `s${Date.now()}`,
        customer: customer.name,
        email: customer.email,
        plan: planObj.name,
        amount: Number(formAmount),
        status: 'active',
        nextDelivery: formNextDelivery || null,
        startedAt: formStart || new Date().toISOString().split('T')[0],
      }
      setSubscriptions((prev) => [newSub, ...prev])
      setSubmitting(false)
      setShowSubForm(false)
      addToast({ message: `Subscription created for ${customer.name}`, type: 'success' })
    }, 800)
  }

  // ── Plan Form Handlers ──────────────────────────────────────────────────────
  const handlePlanSubmit = (planData) => {
    if (planFormTarget === 'new') {
      addPlan(planData)
      addToast({ message: 'Plan created successfully.', type: 'success' })
    } else {
      updatePlan(planFormTarget.id, planData)
      addToast({ message: 'Plan updated successfully.', type: 'success' })
    }
    setPlanFormTarget(null)
  }

  return (
    <AdminPage>
      {/* Change Customer Plan Modal */}
      {changePlanTarget && (
        <ChangePlanModal
          sub={changePlanTarget}
          onClose={() => setChangePlanTarget(null)}
          onConfirm={handleConfirmPlanChange}
          plans={plans.filter((p) => p.status === 'active')}
        />
      )}

      {/* Plan Create/Edit Modal */}
      {planFormTarget && (
        <PlanFormModal
          plan={planFormTarget !== 'new' ? planFormTarget : null}
          onClose={() => setPlanFormTarget(null)}
          onSubmit={handlePlanSubmit}
        />
      )}

      {/* Header Tabs */}
      <div className="flex border-b border-admin-border/60 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 text-[14px] font-bold uppercase tracking-wide border-b-[3px] transition-colors ${
            activeTab === 'subscriptions'
              ? 'border-admin-navy text-admin-navy'
              : 'border-transparent text-admin-text-sub hover:text-admin-navy'
          }`}
        >
          Customer Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-3 text-[14px] font-bold uppercase tracking-wide border-b-[3px] transition-colors ${
            activeTab === 'plans'
              ? 'border-admin-navy text-admin-navy'
              : 'border-transparent text-admin-text-sub hover:text-admin-navy'
          }`}
        >
          Subscription Plans
        </button>
      </div>

      {activeTab === 'subscriptions' && (
        <>
          {/* Summary tiles */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
              <p className="text-2xl font-bold text-admin-navy leading-none mb-1">{subscriptions.length}</p>
              <p className="text-[11px] text-admin-text-sub mt-0.5">Total Subscriptions</p>
            </div>
            <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
              <p className="text-2xl font-bold text-admin-success leading-none mb-1">{activeCount}</p>
              <p className="text-[11px] text-admin-text-sub mt-0.5">Active</p>
            </div>
            <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
              <p className="text-2xl font-bold text-admin-gold leading-none mb-1">{formatCurrency(mrr)}</p>
              <p className="text-[11px] text-admin-text-sub mt-0.5">Est. Monthly Revenue</p>
            </div>
          </div>

          {/* New Subscription form */}
          {showSubForm && (
            <AdminCard title="New Subscription" className="mb-6">
              <form onSubmit={handleSubSubmit} className="p-5 space-y-4">
                {formError && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
                    <span className="material-symbols-outlined text-red-500" style={{ fontSize: '16px' }}>error</span>
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Customer selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                      Customer <span className="text-admin-coral">*</span>
                    </label>
                    <select
                      value={formCustomerId}
                      onChange={(e) => setFormCustomerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none focus:border-admin-navy"
                    >
                      <option value="">— Select customer —</option>
                      {ADMIN_CUSTOMERS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plan selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                      Plan <span className="text-admin-coral">*</span>
                    </label>
                    <select
                      value={formPlanId}
                      onChange={(e) => handlePlanSelectChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none"
                    >
                      <option value="">— Select plan —</option>
                      {plans.filter(p => p.status === 'active').map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount (auto-filled) */}
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                      Amount / week (₹)
                    </label>
                    <input
                      type="number"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none"
                    />
                  </div>

                  {/* Next Delivery */}
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                      Next Delivery
                    </label>
                    <input
                      type="date"
                      value={formNextDelivery}
                      onChange={(e) => setFormNextDelivery(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formStart}
                      onChange={(e) => setFormStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <AdminBtn variant="secondary" onClick={() => setShowSubForm(false)}>Cancel</AdminBtn>
                  <AdminBtn type="submit" variant="primary" disabled={submitting}>
                    {submitting ? 'Saving…' : 'Create Subscription'}
                  </AdminBtn>
                </div>
              </form>
            </AdminCard>
          )}

          {/* Filter panel */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap items-center gap-3">
              <AdminInput
                id="subs-search"
                placeholder="Search customer or plan…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon="search"
                className="w-64"
              />
              <FilterBar
                options={['all', 'active', 'paused', 'cancelled']}
                active={statusFilter}
                onSelect={setStatusFilter}
              />
            </div>
            <AdminBtn icon="add" onClick={handleNewSub}>New Subscription</AdminBtn>
          </div>

          <AdminCard subtitle={`${filteredSubs.length} subscription${filteredSubs.length !== 1 ? 's' : ''}`}>
            <AdminTable headers={['Customer', 'Plan', 'Amount / wk', 'Status', 'Next Delivery', 'Started', 'Actions']}>
              {filteredSubs.map((s) => (
                <Tr key={s.id}>
                  <Td>
                    <div>
                      <p className="font-semibold text-admin-navy">{s.customer}</p>
                      <p className="text-[11px] text-admin-text-sub">{s.email}</p>
                    </div>
                  </Td>
                  <Td><span className="font-medium">{s.plan}</span></Td>
                  <Td><span className="font-bold">{formatCurrency(s.amount)}</span></Td>
                  <Td><StatusBadge status={s.status} /></Td>
                  <Td>
                    {s.nextDelivery
                      ? formatDate(s.nextDelivery)
                      : <span className="text-admin-text-sub">—</span>}
                  </Td>
                  <Td>{formatDate(s.startedAt)}</Td>
                  <Td className="whitespace-nowrap min-w-[310px]">
                    <div className="flex items-center gap-1.5 flex-nowrap">
                      {s.status !== 'cancelled' && (
                        <AdminBtn size="sm" variant="secondary" icon="swap_vert" onClick={() => setChangePlanTarget(s)}>
                          Change Plan
                        </AdminBtn>
                      )}
                      {s.status !== 'cancelled' && (
                        <AdminBtn
                          size="sm"
                          variant={s.status === 'active' ? 'secondary' : 'primary'}
                          disabled={actionLoadingId === s.id}
                          icon={s.status === 'active' ? 'pause' : 'play_arrow'}
                          onClick={() => handleToggleStatus(s.id)}
                        >
                          {actionLoadingId === s.id ? '…' : s.status === 'active' ? 'Pause' : 'Resume'}
                        </AdminBtn>
                      )}
                      {s.status !== 'cancelled' && (
                        <AdminBtn
                          size="sm"
                          variant="danger"
                          icon="close"
                          onClick={() => {
                            if (window.confirm(`Cancel subscription for ${s.customer}?`)) {
                              setSubscriptions((prev) =>
                                prev.map((item) =>
                                  item.id === s.id
                                    ? { ...item, status: 'cancelled', nextDelivery: null }
                                    : item
                                )
                              )
                              addToast({ message: `Subscription cancelled for ${s.customer}`, type: 'info' })
                            }
                          }}
                        >
                          Cancel
                        </AdminBtn>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </AdminTable>
          </AdminCard>
        </>
      )}

      {activeTab === 'plans' && (
        <>
          <div className="flex justify-end mb-5">
            <AdminBtn icon="add" onClick={() => setPlanFormTarget('new')}>
              Create New Plan
            </AdminBtn>
          </div>

          <AdminCard subtitle={`${plans.length} plan${plans.length !== 1 ? 's' : ''}`}>
            {loading ? (
              <SeafoodLoader text="Loading subscription plans..." className="py-8" />
            ) : (
              <AdminTable headers={['Plan Name', 'Price', 'Billing Cycle', 'Features', 'Status', 'Actions']}>
                {plans.map((p) => (
                  <Tr key={p.id}>
                    <Td>
                      <div>
                        <p className="font-semibold text-admin-navy">{p.name}</p>
                        {p.tagline && <p className="text-[11px] text-admin-text-sub">{p.tagline}</p>}
                      </div>
                    </Td>
                    <Td><span className="font-bold">{formatCurrency(p.price)}</span></Td>
                    <Td><span className="capitalize">{p.period}ly</span></Td>
                    <Td>
                      <span className="text-[12px] text-admin-text-sub">
                        {p.highlights?.length || 0} features
                      </span>
                    </Td>
                    <Td><StatusBadge status={p.status || 'active'} /></Td>
                    <Td>
                      <AdminBtn size="sm" variant="secondary" icon="edit" onClick={() => setPlanFormTarget(p)}>
                        Edit Plan
                      </AdminBtn>
                    </Td>
                  </Tr>
                ))}
              </AdminTable>
            )}
          </AdminCard>
        </>
      )}
    </AdminPage>
  )
}
