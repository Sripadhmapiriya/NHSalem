import { useState } from 'react'
import { ADMIN_WHOLESALE } from '@/mock/adminData'
import useToastStore from '@/store/toastStore'
import {
  AdminPage,
  AdminCard,
  AdminTable,
  Tr,
  Td,
  StatusBadge,
  AdminBtn,
  AdminInput,
  Avatar,
  FilterBar,
  formatDate,
} from '@/admin/AdminUI'

const PIPELINE_STAGES = ['new', 'contacted', 'negotiating', 'converted', 'closed']
const INDUSTRIES = ['Restaurant', 'Catering', 'Retail', 'Hospitality', 'Cloud Kitchen', 'Other']

// ── Wholesale Customer Form Modal ─────────────────────────────────────────────
function WholesaleFormModal({ initial, onClose, onSave }) {
  const isEdit = !!initial

  const [businessName, setBusinessName] = useState(initial?.businessName ?? '')
  const [contact, setContact] = useState(initial?.contact ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [industry, setIndustry] = useState(initial?.industry ?? 'Restaurant')
  const [city, setCity] = useState(initial?.city ?? '')
  const [qty, setQty] = useState(initial?.qty ?? '')
  const [status, setStatus] = useState(initial?.status ?? 'new')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!businessName.trim()) errs.businessName = 'Business name is required.'
    if (!contact.trim()) errs.contact = 'Contact person is required.'
    if (!email.trim()) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.'
    if (!city.trim()) errs.city = 'City is required.'
    return errs
  }

  const handleSave = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    setTimeout(() => {
      onSave({
        id: initial?.id ?? `b${Date.now()}`,
        businessName: businessName.trim(),
        contact: contact.trim(),
        email: email.trim(),
        industry,
        city: city.trim(),
        qty: qty.trim(),
        status,
        notes: notes.trim(),
        enquiryDate: initial?.enquiryDate ?? new Date().toISOString().split('T')[0],
      })
      setSaving(false)
    }, 700)
  }

  const inputCls = (f) =>
    `w-full px-3 py-2 rounded-[10px] border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy ${errors[f] ? 'border-red-400' : 'border-admin-border'}`

  const FieldError = ({ field }) =>
    errors[field] ? <p className="text-[11px] text-red-600 mt-1">{errors[field]}</p> : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6" onClick={onClose}>
      <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.2)] w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-admin-border/40 px-6 py-4 flex items-center justify-between rounded-t-[20px]">
          <h2 className="text-[15px] font-bold text-admin-navy">
            {isEdit ? `Edit — ${initial.businessName}` : 'New Wholesale Customer'}
          </h2>
          <button onClick={onClose} className="text-admin-text-sub hover:text-admin-navy">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Business Name */}
          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Business Name *</label>
            <input value={businessName} onChange={(e) => { setBusinessName(e.target.value); setErrors((p) => ({ ...p, businessName: '' })) }} placeholder="e.g. The Sea Kitchen" className={inputCls('businessName')} />
            <FieldError field="businessName" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Contact */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Contact Person *</label>
              <input value={contact} onChange={(e) => { setContact(e.target.value); setErrors((p) => ({ ...p, contact: '' })) }} placeholder="Full name" className={inputCls('contact')} />
              <FieldError field="contact" />
            </div>
            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Email *</label>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }} placeholder="contact@business.com" className={inputCls('email')} />
              <FieldError field="email" />
            </div>
            {/* Industry */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Industry</label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none">
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            {/* City */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">City *</label>
              <input value={city} onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, city: '' })) }} placeholder="e.g. Bangalore" className={inputCls('city')} />
              <FieldError field="city" />
            </div>
            {/* Qty */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Quantity Required</label>
              <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="e.g. 50kg/week" className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none" />
            </div>
            {/* Stage */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Pipeline Stage</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none capitalize">
                {PIPELINE_STAGES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Notes</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes…" className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-admin-border/40 px-6 py-4 flex gap-2 justify-end rounded-b-[20px]">
          <AdminBtn variant="secondary" onClick={onClose}>Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={handleSave} disabled={saving} icon={saving ? 'sync' : 'save'}>
            {saving ? 'Saving…' : isEdit ? 'Update Customer' : 'Create Customer'}
          </AdminBtn>
        </div>
      </div>
    </div>
  )
}

// ── Add Note Modal ────────────────────────────────────────────────────────────
function AddNoteModal({ businessName, onClose, onAdd }) {
  const [note, setNote] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[14px] font-bold text-admin-navy mb-4">Add Note — {businessName}</h3>
        <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note…" className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none resize-none mb-4" />
        <div className="flex gap-2">
          <AdminBtn variant="secondary" onClick={onClose} className="flex-1 justify-center">Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={() => note.trim() && onAdd(note.trim())} className="flex-1 justify-center">Save Note</AdminBtn>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminWholesale() {
  const { addToast } = useToastStore()
  const [inquiries, setInquiries] = useState(ADMIN_WHOLESALE)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [formModal, setFormModal] = useState(null) // null | { mode: 'create' } | { mode: 'edit', inquiry }
  const [noteModal, setNoteModal] = useState(false)

  const filtered = inquiries.filter((b) => {
    const matchSearch =
      !search ||
      b.businessName.toLowerCase().includes(search.toLowerCase()) ||
      b.contact.toLowerCase().includes(search.toLowerCase()) ||
      b.industry.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const byStage = (stage) => inquiries.filter((b) => b.status === stage).length

  // Sync selectedInquiry with latest state
  const currentSelected = selectedInquiry
    ? inquiries.find((i) => i.id === selectedInquiry.id)
    : null

  // ── CRUD Handlers ───────────────────────────────────────────────────────────

  const handleSave = (data) => {
    if (formModal?.mode === 'edit') {
      setInquiries((prev) => prev.map((i) => (i.id === data.id ? data : i)))
      if (selectedInquiry?.id === data.id) setSelectedInquiry(data)
      addToast({ message: `${data.businessName} updated.`, type: 'success' })
    } else {
      setInquiries((prev) => [data, ...prev])
      addToast({ message: `${data.businessName} added as a wholesale customer.`, type: 'success' })
    }
    setFormModal(null)
  }

  const handleDelete = (inquiry) => {
    if (!window.confirm(`Remove ${inquiry.businessName} from wholesale customers?`)) return
    setInquiries((prev) => prev.filter((i) => i.id !== inquiry.id))
    if (selectedInquiry?.id === inquiry.id) setSelectedInquiry(null)
    addToast({ message: `${inquiry.businessName} removed.`, type: 'info' })
  }

  const handleMoveStage = (inquiryId, newStage) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === inquiryId ? { ...i, status: newStage } : i))
    )
    const inq = inquiries.find((i) => i.id === inquiryId)
    addToast({ message: `${inq?.businessName} moved to "${newStage}".`, type: 'success' })
  }

  const handleAddNote = (noteText) => {
    const timestamp = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const newNote = `[${timestamp}] ${noteText}`
    setInquiries((prev) =>
      prev.map((i) => {
        if (i.id === currentSelected.id) {
          const existing = i.notes ? `${i.notes}\n${newNote}` : newNote
          return { ...i, notes: existing }
        }
        return i
      })
    )
    setNoteModal(false)
    addToast({ message: 'Note added.', type: 'success' })
  }

  return (
    <AdminPage>
      {/* Form Modal */}
      {formModal && (
        <WholesaleFormModal
          initial={formModal.mode === 'edit' ? formModal.inquiry : null}
          onClose={() => setFormModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Note Modal */}
      {noteModal && currentSelected && (
        <AddNoteModal
          businessName={currentSelected.businessName}
          onClose={() => setNoteModal(false)}
          onAdd={handleAddNote}
        />
      )}

      {/* Pipeline Kanban Summary */}
      <div className="flex gap-3 mb-5 overflow-x-auto pb-1">
        {PIPELINE_STAGES.map((stage) => (
          <div
            key={stage}
            className="flex-shrink-0 bg-white rounded-[12px] border border-admin-border/60 px-4 py-3 min-w-[120px] text-center cursor-pointer hover:border-admin-navy/40 transition-colors"
            onClick={() => setStatusFilter(stage === statusFilter ? 'all' : stage)}
          >
            <p className="text-xl font-bold text-admin-navy">{byStage(stage)}</p>
            <StatusBadge status={stage} />
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <AdminInput
            id="wholesale-search"
            placeholder="Search business, contact, industry…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon="search"
            className="w-64"
          />
          <FilterBar
            options={['all', ...PIPELINE_STAGES]}
            active={statusFilter}
            onSelect={setStatusFilter}
          />
        </div>
        {/* New Customer button */}
        <AdminBtn icon="add" onClick={() => setFormModal({ mode: 'create' })}>
          New Customer
        </AdminBtn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Inquiries table */}
        <AdminCard className="lg:col-span-2" subtitle={`${filtered.length} customer${filtered.length !== 1 ? 's' : ''}`}>
          <AdminTable headers={['Business', 'Contact', 'Industry', 'City', 'Qty / wk', 'Date', 'Stage', 'Actions']}>
            {filtered.map((b) => (
              <Tr
                key={b.id}
                onClick={() => setSelectedInquiry(b)}
                className={selectedInquiry?.id === b.id ? 'bg-admin-seafoam/80' : ''}
              >
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar name={b.businessName} />
                    <span className="font-semibold text-[12px] text-admin-navy">{b.businessName}</span>
                  </div>
                </Td>
                <Td>
                  <p className="text-[12px]">{b.contact}</p>
                  <p className="text-[11px] text-admin-text-sub">{b.email}</p>
                </Td>
                <Td>{b.industry}</Td>
                <Td>{b.city}</Td>
                <Td><span className="font-semibold">{b.qty || '—'}</span></Td>
                <Td><span className="text-[11px]">{formatDate(b.enquiryDate)}</span></Td>
                <Td><StatusBadge status={b.status} /></Td>
                <Td>
                  <div className="flex gap-1">
                    {/* Edit */}
                    <AdminBtn
                      size="sm"
                      variant="secondary"
                      icon="edit"
                      onClick={(e) => { e.stopPropagation(); setFormModal({ mode: 'edit', inquiry: b }) }}
                    >
                      Edit
                    </AdminBtn>
                    {/* Delete */}
                    <AdminBtn
                      size="sm"
                      variant="danger"
                      icon="delete"
                      onClick={(e) => { e.stopPropagation(); handleDelete(b) }}
                    >
                      Delete
                    </AdminBtn>
                  </div>
                </Td>
              </Tr>
            ))}
          </AdminTable>
        </AdminCard>

        {/* Detail panel */}
        {currentSelected ? (
          <AdminCard
            title={currentSelected.businessName}
            action={
              <button onClick={() => setSelectedInquiry(null)}>
                <span className="material-symbols-outlined text-admin-text-sub hover:text-admin-navy" style={{ fontSize: '18px' }}>close</span>
              </button>
            }
          >
            <div className="p-4 space-y-4 text-[13px]">
              <div className="space-y-2">
                {[
                  ['Contact', currentSelected.contact],
                  ['Email', currentSelected.email],
                  ['Industry', currentSelected.industry],
                  ['City', currentSelected.city],
                  ['Qty Required', currentSelected.qty || '—'],
                  ['Enquiry Date', formatDate(currentSelected.enquiryDate)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <span className="text-admin-text-sub text-[11px] font-semibold uppercase tracking-wide">{label}</span>
                    <span className="font-medium text-admin-navy text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Pipeline Stage */}
              <div>
                <p className="text-[11px] font-bold text-admin-text uppercase tracking-wide mb-1.5">Pipeline Stage</p>
                <StatusBadge status={currentSelected.status} />
              </div>

              {/* Move to Stage */}
              <div>
                <p className="text-[11px] font-bold text-admin-text uppercase tracking-wide mb-2">Move to Stage</p>
                <div className="flex flex-wrap gap-1.5">
                  {PIPELINE_STAGES.filter((s) => s !== currentSelected.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleMoveStage(currentSelected.id, s)}
                      className="px-2.5 py-1 rounded-full border border-admin-border text-[11px] font-semibold text-admin-text-sub hover:border-admin-navy hover:text-admin-navy capitalize transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {currentSelected.notes && (
                <div>
                  <p className="text-[11px] font-bold text-admin-text uppercase tracking-wide mb-1.5">Notes</p>
                  <p className="text-[12px] text-admin-text-sub bg-admin-seafoam p-3 rounded-[10px] whitespace-pre-wrap">{currentSelected.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <a
                  href={`mailto:${currentSelected.email}?subject=NH Salem Wholesale Enquiry — ${currentSelected.businessName}`}
                  className="flex-1"
                >
                  <AdminBtn size="sm" icon="email" className="w-full justify-center">
                    Send Email
                  </AdminBtn>
                </a>
                <AdminBtn size="sm" variant="secondary" icon="note_add" onClick={() => setNoteModal(true)}>
                  Add Note
                </AdminBtn>
              </div>
            </div>
          </AdminCard>
        ) : (
          <AdminCard>
            <div className="p-8 text-center text-admin-text-sub">
              <span className="material-symbols-outlined mb-2" style={{ fontSize: '32px' }}>business_center</span>
              <p className="text-[13px] font-medium">Select a customer to see details</p>
            </div>
          </AdminCard>
        )}
      </div>
    </AdminPage>
  )
}
