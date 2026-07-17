import { useState, useEffect } from 'react'
import useToastStore from '@/store/toastStore'
import { AdminPage, AdminCard, AdminTable, Tr, Td, StatusBadge, AdminBtn, AdminInput } from '@/admin/AdminUI'
import { getAdminCities, addAdminCity, updateAdminCity, deleteAdminCity } from '@/services/adminApi'

/**
 * Store Locator / Delivery Zones Admin Page
 *
 * This page IS needed and linked from the admin sidebar nav.
 * It manages the delivery zone data (cities, pincodes, slots) that powers
 * the user-facing /stores page. All buttons are wired and functional.
 */

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── City Form Modal ───────────────────────────────────────────────────────────
function CityFormModal({ initial, onClose, onSave }) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? '')
  const [pincode, setPincode] = useState(initial?.pincode ?? '')
  const [stores, setStores] = useState(initial?.stores ?? 1)
  const [status, setStatus] = useState(initial?.status ?? 'live')
  const [slotsText, setSlotsText] = useState((initial?.slots ?? []).join('\n'))
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'City name is required.'
    if (status === 'live' && !pincode.trim()) errs.pincode = 'Pincode is required for live cities.'
    return errs
  }

  const handleSave = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    setTimeout(() => {
      onSave({
        id: initial?.id ?? name.toLowerCase().replace(/\s+/g, '-'),
        name: name.trim(),
        pincode: pincode.trim(),
        stores: Number(stores),
        status,
        slots: slotsText.split('\n').map((s) => s.trim()).filter(Boolean),
      })
      setSaving(false)
    }, 600)
  }

  const inputCls = (f) =>
    `w-full px-3 py-2 rounded-[10px] border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy ${errors[f] ? 'border-red-400' : 'border-admin-border'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-admin-navy">{isEdit ? `Edit — ${initial.name}` : 'Add New City'}</h3>
          <button onClick={onClose} className="text-admin-text-sub hover:text-admin-navy">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <div className="space-y-3">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">City Name *</label>
            <input value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }} placeholder="e.g. Bangalore" className={inputCls('name')} />
            {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none">
              <option value="live">Live</option>
              <option value="coming_soon">Coming Soon</option>
            </select>
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Pincode {status === 'live' ? '*' : ''}</label>
            <input value={pincode} onChange={(e) => { setPincode(e.target.value); setErrors((p) => ({ ...p, pincode: '' })) }} placeholder="e.g. 560001" className={inputCls('pincode')} />
            {errors.pincode && <p className="text-[11px] text-red-600 mt-1">{errors.pincode}</p>}
          </div>

          {/* Stores */}
          {status === 'live' && (
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Number of Stores</label>
              <input type="number" min={0} value={stores} onChange={(e) => setStores(e.target.value)} className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none" />
            </div>
          )}

          {/* Slots */}
          {status === 'live' && (
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                Delivery Slots <span className="text-[10px] font-normal text-admin-text-sub normal-case">(one per line)</span>
              </label>
              <textarea
                rows={4}
                value={slotsText}
                onChange={(e) => setSlotsText(e.target.value)}
                placeholder={"7–9 AM\n9–11 AM\n5–7 PM"}
                className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none resize-none font-mono"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <AdminBtn variant="secondary" onClick={onClose} className="flex-1 justify-center">Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={handleSave} disabled={saving} className="flex-1 justify-center">
            {saving ? 'Saving…' : isEdit ? 'Update City' : 'Add City'}
          </AdminBtn>
        </div>
      </div>
    </div>
  )
}

// ── Add Slot Modal ────────────────────────────────────────────────────────────
function AddSlotModal({ cityName, onClose, onAdd }) {
  const [slot, setSlot] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[14px] font-bold text-admin-navy mb-4">Add Slot — {cityName}</h3>
        <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Slot Time</label>
        <input value={slot} onChange={(e) => setSlot(e.target.value)} placeholder="e.g. 7–9 AM" className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none mb-4" />
        <div className="flex gap-2">
          <AdminBtn variant="secondary" onClick={onClose} className="flex-1 justify-center">Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={() => slot.trim() && onAdd(slot.trim())} className="flex-1 justify-center">Add Slot</AdminBtn>
        </div>
      </div>
    </div>
  )
}

// ── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({ title, message, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[14px] font-bold text-admin-navy mb-2">{title || 'Confirm Action'}</h3>
        <p className="text-[13px] text-admin-text-sub mb-5">{message}</p>
        <div className="flex gap-2">
          <AdminBtn variant="secondary" onClick={onClose} className="flex-1 justify-center">Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={() => { onConfirm(); onClose(); }} className="flex-1 justify-center bg-admin-coral hover:bg-admin-coral/90 text-white">Confirm</AdminBtn>
        </div>
      </div>
    </div>
  )
}

// ── Pagination Controls ───────────────────────────────────────────────────────
function PaginationControls({ currentPage, totalItems, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-admin-border/30 pt-3 mt-3 px-1">
      <span className="text-[11px] text-admin-text-sub font-medium">
        Showing Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-1.5">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-2.5 py-1 rounded-[6px] border border-admin-border text-[11px] font-semibold text-admin-navy hover:bg-admin-seafoam disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          Prev
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-2.5 py-1 rounded-[6px] border border-admin-border text-[11px] font-semibold text-admin-navy hover:bg-admin-seafoam disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminStoreLocator() {
  const { addToast } = useToastStore()
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState(null)
  const [cityModal, setCityModal] = useState(null) // null | { mode: 'add' } | { mode: 'edit', city }
  const [slotModal, setSlotModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState(null)
  const [livePage, setLivePage] = useState(1)
  const [comingPage, setComingPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  const fetchCities = () => {
    setLoading(true)
    getAdminCities()
      .then((res) => {
        if (res.success) {
          const normalized = (res.cities || []).map(c => ({
            ...c,
            slots: typeof c.slots === 'string' ? JSON.parse(c.slots) : (c.slots || [])
          }))
          setCities(normalized)
        }
      })
      .catch((err) => {
        addToast({ message: `Failed to load cities: ${err.message}`, type: 'error' })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCities()
  }, [])

  const live = cities.filter((c) => c.status === 'live')
  const coming = cities.filter((c) => c.status === 'coming_soon')

  const totalLivePages = Math.ceil(live.length / ITEMS_PER_PAGE)
  const activeLivePage = Math.min(livePage, totalLivePages || 1)
  const paginatedLive = live.slice((activeLivePage - 1) * ITEMS_PER_PAGE, activeLivePage * ITEMS_PER_PAGE)

  const totalComingPages = Math.ceil(coming.length / ITEMS_PER_PAGE)
  const activeComingPage = Math.min(comingPage, totalComingPages || 1)
  const paginatedComing = coming.slice((activeComingPage - 1) * ITEMS_PER_PAGE, activeComingPage * ITEMS_PER_PAGE)

  const selected = selectedCity ? cities.find((c) => c.id === selectedCity.id) : null

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveCity = async (data) => {
    const isEdit = cityModal?.mode === 'edit'
    try {
      if (isEdit) {
        const res = await updateAdminCity(data.id, data)
        if (res.success) {
          addToast({ message: `${data.name} updated.`, type: 'success' })
          fetchCities()
        }
      } else {
        const res = await addAdminCity(data)
        if (res.success) {
          addToast({ message: `${data.name} added as a delivery zone.`, type: 'success' })
          fetchCities()
        }
      }
      setCityModal(null)
    } catch (err) {
      addToast({ message: `Failed to save city: ${err.message}`, type: 'error' })
    }
  }

  const handleGoLive = async (cityId) => {
    const city = cities.find((c) => c.id === cityId)
    if (!city) return
    const updatedData = {
      ...city,
      status: 'live',
      pincode: city.pincode || '',
      stores: city.stores || 0,
      slots: city.slots || []
    }
    try {
      const res = await updateAdminCity(cityId, updatedData)
      if (res.success) {
        addToast({ message: `${city.name} is now live!`, type: 'success' })
        fetchCities()
      }
    } catch (err) {
      addToast({ message: `Failed to update status: ${err.message}`, type: 'error' })
    }
  }

  const handleDeactivate = async (cityId) => {
    const city = cities.find((c) => c.id === cityId)
    if (!city) return
    setConfirmModal({
      title: 'Deactivate City',
      message: `Are you sure you want to deactivate ${city.name}? It will move to Coming Soon.`,
      onConfirm: async () => {
        const updatedData = {
          ...city,
          status: 'coming_soon'
        }
        try {
          const res = await updateAdminCity(cityId, updatedData)
          if (res.success) {
            addToast({ message: `${city.name} deactivated.`, type: 'info' })
            setSelectedCity(null)
            fetchCities()
          }
        } catch (err) {
          addToast({ message: `Failed to deactivate city: ${err.message}`, type: 'error' })
        }
      }
    })
  }

  const handleAddSlot = async (slot) => {
    if (!selectedCity) return
    const updatedSlots = [...(selectedCity.slots ?? []), slot]
    const updatedData = {
      ...selectedCity,
      slots: updatedSlots
    }
    try {
      const res = await updateAdminCity(selectedCity.id, updatedData)
      if (res.success) {
        addToast({ message: `Slot "${slot}" added to ${selectedCity.name}.`, type: 'success' })
        fetchCities()
      }
      setSlotModal(false)
    } catch (err) {
      addToast({ message: `Failed to add slot: ${err.message}`, type: 'error' })
    }
  }

  const handleRemoveSlot = async (cityId, slot) => {
    const city = cities.find((c) => c.id === cityId)
    if (!city) return
    const updatedSlots = (city.slots ?? []).filter((s) => s !== slot)
    const updatedData = {
      ...city,
      slots: updatedSlots
    }
    try {
      const res = await updateAdminCity(cityId, updatedData)
      if (res.success) {
        addToast({ message: `Slot removed from ${city.name}.`, type: 'success' })
        fetchCities()
      }
    } catch (err) {
      addToast({ message: `Failed to remove slot: ${err.message}`, type: 'error' })
    }
  }

  return (
    <AdminPage>
      {/* City Form Modal */}
      {cityModal && (
        <CityFormModal
          initial={cityModal.mode === 'edit' ? cityModal.city : null}
          onClose={() => setCityModal(null)}
          onSave={handleSaveCity}
        />
      )}

      {/* Add Slot Modal */}
      {slotModal && selectedCity && (
        <AddSlotModal
          cityName={selectedCity.name}
          onClose={() => setSlotModal(false)}
          onAdd={handleAddSlot}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
          <p className="text-2xl font-bold text-admin-navy">{live.length}</p>
          <p className="text-[11px] text-admin-text-sub mt-0.5">Live Cities</p>
        </div>
        <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
          <p className="text-2xl font-bold text-admin-gold">{coming.length}</p>
          <p className="text-[11px] text-admin-text-sub mt-0.5">Coming Soon</p>
        </div>
        <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
          <p className="text-2xl font-bold text-admin-success">{live.reduce((sum, c) => sum + (c.stores ?? 0), 0)}</p>
          <p className="text-[11px] text-admin-text-sub mt-0.5">Total Stores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live cities table */}
        <AdminCard
          title="Live Delivery Zones"
          action={
            <AdminBtn size="sm" icon="add" onClick={() => setCityModal({ mode: 'add' })}>
              Add City
            </AdminBtn>
          }
        >
          <AdminTable headers={['City', 'Pincode', 'Stores', 'Slots', 'Status', '']}>
            {paginatedLive.map((city) => (
              <Tr
                key={city.id}
                onClick={() => setSelectedCity(selectedCity?.id === city.id ? null : city)}
                className={selectedCity?.id === city.id ? 'bg-admin-seafoam/80' : ''}
              >
                <Td><span className="font-semibold text-admin-navy">{city.name}</span></Td>
                <Td><code className="text-[12px] font-mono">{city.pincode}</code></Td>
                <Td>{city.stores}</Td>
                <Td><span className="text-[12px]">{city.slots?.length ?? 0} slots</span></Td>
                <Td><StatusBadge status="active" /></Td>
                <Td>
                  <AdminBtn
                    size="sm"
                    variant="secondary"
                    icon="edit"
                    onClick={(e) => { e.stopPropagation(); setCityModal({ mode: 'edit', city }) }}
                  >
                    Edit
                  </AdminBtn>
                </Td>
              </Tr>
            ))}
          </AdminTable>
          <PaginationControls
            currentPage={activeLivePage}
            totalItems={live.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setLivePage}
          />
        </AdminCard>

        {/* City detail panel OR Coming Soon list */}
        <div className="space-y-5">
          {selected ? (
            <AdminCard
              title={`${selected.name} — Delivery Slots`}
              action={
                <button onClick={() => setSelectedCity(null)} className="text-admin-text-sub hover:text-admin-navy">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              }
            >
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div className="bg-admin-seafoam rounded-[10px] p-3">
                    <p className="text-[10px] text-admin-text-sub uppercase tracking-wide mb-1">Pincode</p>
                    <p className="font-bold font-mono text-admin-navy">{selected.pincode}</p>
                  </div>
                  <div className="bg-admin-seafoam rounded-[10px] p-3">
                    <p className="text-[10px] text-admin-text-sub uppercase tracking-wide mb-1">Stores</p>
                    <p className="font-bold text-admin-navy">{selected.stores}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-2">
                    Delivery Slots
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selected.slots?.map((slot) => (
                      <div key={slot} className="flex items-center gap-1 px-2.5 py-1 bg-white border border-admin-border rounded-full">
                        <span className="text-[12px] font-medium text-admin-navy">{slot}</span>
                        <button
                          onClick={() => handleRemoveSlot(selected.id, slot)}
                          className="text-admin-text-sub hover:text-admin-coral ml-0.5"
                          title="Remove slot"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                        </button>
                      </div>
                    ))}
                    {(!selected.slots || selected.slots.length === 0) && (
                      <p className="text-[12px] text-admin-text-sub">No slots configured.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <AdminBtn size="sm" icon="add_circle" onClick={() => setSlotModal(true)}>
                    Add Slot
                  </AdminBtn>
                  <AdminBtn size="sm" variant="danger" onClick={() => handleDeactivate(selected.id)}>
                    Deactivate City
                  </AdminBtn>
                </div>
              </div>
            </AdminCard>
          ) : (
            <AdminCard
              title="Coming Soon Cities"
              action={
                <AdminBtn size="sm" icon="add" onClick={() => setCityModal({ mode: 'add' })}>
                  Add City
                </AdminBtn>
              }
            >
              <div className="divide-y divide-admin-border/30">
                {paginatedComing.map((city) => (
                  <div key={city.id} className="flex items-center justify-between px-5 py-3">
                    <span className="font-medium text-[13px] text-admin-navy">{city.name}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status="scheduled" />
                      <AdminBtn
                        size="sm"
                        variant="primary"
                        onClick={() => handleGoLive(city.id)}
                      >
                        Go Live
                      </AdminBtn>
                      <AdminBtn
                        size="sm"
                        variant="secondary"
                        icon="edit"
                        onClick={() => setCityModal({ mode: 'edit', city })}
                      >
                        Edit
                      </AdminBtn>
                    </div>
                  </div>
                ))}
                {coming.length === 0 && (
                  <p className="text-center py-8 text-[13px] text-admin-text-sub">No coming-soon cities.</p>
                )}
              </div>
              <PaginationControls
                currentPage={activeComingPage}
                totalItems={coming.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setComingPage}
              />
            </AdminCard>
          )}
        </div>
      </div>
      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
        />
      )}
    </AdminPage>
  )
}
