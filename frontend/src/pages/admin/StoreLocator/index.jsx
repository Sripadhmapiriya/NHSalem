import { useState } from 'react'
import CITIES from '@/mock/cities'
import useToastStore from '@/store/toastStore'
import { AdminPage, AdminCard, AdminTable, Tr, Td, StatusBadge, AdminBtn, AdminInput } from '@/admin/AdminUI'

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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminStoreLocator() {
  const { addToast } = useToastStore()
  const [cities, setCities] = useState(CITIES)
  const [selectedCity, setSelectedCity] = useState(null)
  const [cityModal, setCityModal] = useState(null) // null | { mode: 'add' } | { mode: 'edit', city }
  const [slotModal, setSlotModal] = useState(false)

  const live = cities.filter((c) => c.status === 'live')
  const coming = cities.filter((c) => c.status === 'coming_soon')
  const selected = selectedCity ? cities.find((c) => c.id === selectedCity.id) : null

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveCity = (data) => {
    const isEdit = cityModal?.mode === 'edit'
    if (isEdit) {
      setCities((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)))
      if (selectedCity?.id === data.id) setSelectedCity(data)
      addToast({ message: `${data.name} updated.`, type: 'success' })
    } else {
      setCities((prev) => [...prev, data])
      addToast({ message: `${data.name} added as a delivery zone.`, type: 'success' })
    }
    setCityModal(null)
  }

  const handleGoLive = (cityId) => {
    setCities((prev) =>
      prev.map((c) => c.id === cityId ? { ...c, status: 'live', pincode: c.pincode || '', stores: c.stores || 0, slots: c.slots || [] } : c)
    )
    const city = cities.find((c) => c.id === cityId)
    addToast({ message: `${city?.name} is now live!`, type: 'success' })
  }

  const handleDeactivate = (cityId) => {
    const city = cities.find((c) => c.id === cityId)
    if (!window.confirm(`Deactivate ${city?.name}? It will move to Coming Soon.`)) return
    setCities((prev) => prev.map((c) => c.id === cityId ? { ...c, status: 'coming_soon' } : c))
    setSelectedCity(null)
    addToast({ message: `${city?.name} deactivated.`, type: 'info' })
  }

  const handleAddSlot = (slot) => {
    setCities((prev) =>
      prev.map((c) =>
        c.id === selectedCity.id ? { ...c, slots: [...(c.slots ?? []), slot] } : c
      )
    )
    setSlotModal(false)
    addToast({ message: `Slot "${slot}" added to ${selectedCity.name}.`, type: 'success' })
  }

  const handleRemoveSlot = (cityId, slot) => {
    setCities((prev) =>
      prev.map((c) =>
        c.id === cityId ? { ...c, slots: (c.slots ?? []).filter((s) => s !== slot) } : c
      )
    )
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
            {live.map((city) => (
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
                {coming.map((city) => (
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
            </AdminCard>
          )}
        </div>
      </div>
    </AdminPage>
  )
}
