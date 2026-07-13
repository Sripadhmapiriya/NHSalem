import { useState, useEffect } from 'react'
import useToastStore from '@/store/toastStore'
import {
  getAdminWholesale,
  createAdminWholesale,
  updateAdminWholesale,
  deleteAdminWholesale,
} from '@/services/adminApi'
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
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [industry, setIndustry] = useState(initial?.industry ?? 'Restaurant')
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
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    try {
      const payload = {
        businessName: businessName.trim(),
        contactName: contact.trim(),
        email: email.trim(),
        phone: phone.trim() || '0000000000',
        industry,
        qty: qty.trim(),
        specifications: notes.trim(),
        status
      }
      await onSave(payload)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
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
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Email Address *</label>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }} placeholder="name@business.com" className={inputCls('email')} />
              <FieldError field="email" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy" />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Industry Type</label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy">
                {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Qty Required */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Est. Qty Required (kg/week)</label>
              <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="e.g. 50-100 kg" className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy" />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Pipeline Stage</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy capitalize">
                {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Additional Specifications / Notes</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Requires clean-cut fillets, packing in thermocol boxes with dry ice." className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-admin-border/40 px-6 py-4 flex gap-3 justify-end rounded-b-[20px]">
          <AdminBtn variant="secondary" onClick={onClose}>Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Customer'}
          </AdminBtn>
        </div>
      </div>
    </div>
  )
}

// ── Notes Modal ───────────────────────────────────────────────────────────────
function AddNoteModal({ onClose, onSave }) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = () => {
    if (!note.trim()) return
    setSaving(true)
    setTimeout(() => {
      onSave(note.trim())
      setSaving(false)
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.2)] w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-admin-border/40 flex justify-between items-center rounded-t-[20px]">
          <h3 className="font-bold text-[14px] text-admin-navy">Add Consultation Note</h3>
          <button onClick={onClose} className="text-admin-text-sub hover:text-admin-navy">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <textarea
            required
            rows={4}
            placeholder="Write details from phone call, pricing discussion, or specific delivery logistics here…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy resize-none"
          />
        </div>
        <div className="px-6 py-4 border-t border-admin-border/40 flex gap-3 justify-end rounded-b-[20px]">
          <AdminBtn variant="secondary" onClick={onClose}>Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={handleSubmit} disabled={saving || !note.trim()}>
            {saving ? 'Saving…' : 'Add Note'}
          </AdminBtn>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminWholesale() {
  const { addToast } = useToastStore()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')

  const [selectedInquiryId, setSelectedInquiryId] = useState(null)
  const [formModal, setFormModal] = useState(null) // { mode: 'create'|'edit', inquiry?: obj }
  const [noteModal, setNoteModal] = useState(false)

  useEffect(() => {
    loadInquiries()
  }, [])

  const loadInquiries = async () => {
    setLoading(true)
    try {
      const res = await getAdminWholesale()
      if (res.success) {
        setInquiries(res.inquiries)
      }
    } catch (err) {
      console.error(err)
      addToast({ message: 'Failed to load wholesale inquiries', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Action Handlers
  const handleSaveModal = async (formPayload) => {
    try {
      if (formModal.mode === 'edit') {
        const updated = await updateAdminWholesale(formModal.inquiry.id, formPayload)
        setInquiries((prev) => prev.map((item) => (item.id === formModal.inquiry.id ? updated : item)))
        addToast({ message: `Wholesale business "${formPayload.businessName}" updated successfully.`, type: 'success' })
      } else {
        const created = await createAdminWholesale(formPayload)
        setInquiries((prev) => [created, ...prev])
        addToast({ message: `New wholesale customer "${formPayload.businessName}" created.`, type: 'success' })
      }
      setFormModal(null)
    } catch (err) {
      addToast({ message: err.message || 'Failed to save customer details', type: 'error' })
    }
  }

  const handleDelete = async (inquiry) => {
    if (!window.confirm(`Permanently remove ${inquiry.businessName} from the database?`)) return
    try {
      await deleteAdminWholesale(inquiry.id)
      setInquiries((prev) => prev.filter((item) => item.id !== inquiry.id))
      if (selectedInquiryId === inquiry.id) setSelectedInquiryId(null)
      addToast({ message: `Customer profile for ${inquiry.businessName} deleted.`, type: 'info' })
    } catch (err) {
      addToast({ message: err.message || 'Failed to delete customer profile', type: 'error' })
    }
  }

  const handleMoveStage = async (id, nextStage) => {
    const original = inquiries.find((item) => item.id === id)
    if (!original) return
    try {
      const payload = {
        businessName: original.businessName,
        contactName: original.contact,
        email: original.email,
        phone: original.phone || '0000000000',
        industry: original.industry,
        qty: original.qty,
        specifications: original.notes,
        status: nextStage
      }
      const updated = await updateAdminWholesale(id, payload)
      setInquiries((prev) => prev.map((item) => (item.id === id ? updated : item)))
      addToast({ message: `Pipeline stage moved to ${nextStage}.`, type: 'success' })
    } catch (err) {
      addToast({ message: err.message || 'Failed to update pipeline stage', type: 'error' })
    }
  }

  const handleAddNoteText = async (noteText) => {
    const original = inquiries.find((item) => item.id === selectedInquiryId)
    if (!original) return
    const appendedNotes = original.notes 
      ? `${original.notes}\n\n[Note - ${new Date().toLocaleDateString('en-IN')}]: ${noteText}`
      : `[Note - ${new Date().toLocaleDateString('en-IN')}]: ${noteText}`

    try {
      const payload = {
        businessName: original.businessName,
        contactName: original.contact,
        email: original.email,
        phone: original.phone || '0000000000',
        industry: original.industry,
        qty: original.qty,
        specifications: appendedNotes,
        status: original.status
      }
      const updated = await updateAdminWholesale(selectedInquiryId, payload)
      setInquiries((prev) => prev.map((item) => (item.id === selectedInquiryId ? updated : item)))
      setNoteModal(false)
      addToast({ message: 'Consultation note appended successfully.', type: 'success' })
    } catch (err) {
      addToast({ message: err.message || 'Failed to append consultation note', type: 'error' })
    }
  }

  // Filters
  const filtered = inquiries.filter((b) => {
    const matchSearch =
      !search ||
      b.businessName.toLowerCase().includes(search.toLowerCase()) ||
      b.contact.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase())
    const matchStage = stageFilter === 'all' || b.status === stageFilter
    return matchSearch && matchStage
  })

  // Selected object matching
  const currentSelected = inquiries.find((item) => item.id === selectedInquiryId) || null

  return (
    <AdminPage>
      {/* Modals */}
      {formModal && (
        <WholesaleFormModal
          initial={formModal.mode === 'edit' ? formModal.inquiry : null}
          onClose={() => setFormModal(null)}
          onSave={handleSaveModal}
        />
      )}
      {noteModal && (
        <AddNoteModal
          onClose={() => setNoteModal(false)}
          onSave={handleAddNoteText}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
          <p className="text-2xl font-bold text-admin-navy">{inquiries.length}</p>
          <p className="text-[11px] text-admin-text-sub mt-0.5">Total Leads</p>
        </div>
        <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
          <p className="text-2xl font-bold text-admin-gold">
            {inquiries.filter((b) => b.status === 'new').length}
          </p>
          <p className="text-[11px] text-admin-text-sub mt-0.5">New</p>
        </div>
        <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
          <p className="text-2xl font-bold text-admin-navy">
            {inquiries.filter((b) => b.status === 'negotiating').length}
          </p>
          <p className="text-[11px] text-admin-text-sub mt-0.5">Negotiating</p>
        </div>
        <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
          <p className="text-2xl font-bold text-admin-success">
            {inquiries.filter((b) => b.status === 'converted').length}
          </p>
          <p className="text-[11px] text-admin-text-sub mt-0.5">Converted</p>
        </div>
      </div>

      {/* Actions and filter row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <AdminInput
            id="wholesale-search"
            placeholder="Search business, contact, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon="search"
            className="w-64"
          />
          <FilterBar
            options={['all', ...PIPELINE_STAGES]}
            active={stageFilter}
            onSelect={setStageFilter}
          />
        </div>
        <AdminBtn icon="add" onClick={() => setFormModal({ mode: 'create' })}>
          Add Customer
        </AdminBtn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Inquiries table */}
        <AdminCard className="lg:col-span-2" subtitle={`${filtered.length} customer${filtered.length !== 1 ? 's' : ''}`}>
          {loading ? (
            <div className="text-center py-10 font-semibold text-admin-navy">
              Loading wholesale inquiries...
            </div>
          ) : (
            <AdminTable headers={['Business', 'Contact', 'Industry', 'Qty / wk', 'Date', 'Stage', 'Actions']}>
              {filtered.map((b) => (
                <Tr
                  key={b.id}
                  onClick={() => setSelectedInquiryId(b.id)}
                  className={selectedInquiryId === b.id ? 'bg-admin-seafoam/80' : ''}
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
                  <Td><span className="font-semibold">{b.qty || '—'}</span></Td>
                  <Td><span className="text-[11px]">{formatDate(b.enquiryDate)}</span></Td>
                  <Td><StatusBadge status={b.status} /></Td>
                  <Td>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <AdminBtn
                        size="sm"
                        variant="secondary"
                        icon="edit"
                        onClick={() => setFormModal({ mode: 'edit', inquiry: b })}
                      >
                        Edit
                      </AdminBtn>
                      <AdminBtn
                        size="sm"
                        variant="danger"
                        icon="delete"
                        onClick={() => handleDelete(b)}
                      >
                        Delete
                      </AdminBtn>
                    </div>
                  </Td>
                </Tr>
              ))}
            </AdminTable>
          )}
        </AdminCard>

        {/* Detail panel */}
        {currentSelected ? (
          <AdminCard
            title={currentSelected.businessName}
            action={
              <button onClick={() => setSelectedInquiryId(null)}>
                <span className="material-symbols-outlined text-admin-text-sub hover:text-admin-navy" style={{ fontSize: '18px' }}>close</span>
              </button>
            }
          >
            <div className="p-4 space-y-4 text-[13px]">
              <div className="space-y-2">
                {[
                  ['Contact', currentSelected.contact],
                  ['Email', currentSelected.email],
                  ['Phone', currentSelected.phone || '—'],
                  ['Industry', currentSelected.industry],
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
