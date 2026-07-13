import { useState } from 'react'
import { ADMIN_REVIEWS } from '@/mock/adminData'
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

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined leading-none ${i <= rating ? 'text-admin-gold' : 'text-admin-border'}`}
          style={{ fontSize: '13px', fontVariationSettings: i <= rating ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  )
}

// ── Reply Modal ───────────────────────────────────────────────────────────────
function ReplyModal({ review, onClose, onSubmit }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!text.trim()) return
    setSubmitting(true)
    setTimeout(() => {
      onSubmit(text.trim())
      setSubmitting(false)
    }, 600)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-bold text-admin-navy">Reply to Review</h3>
            <p className="text-[11px] text-admin-text-sub">{review.author} — {review.product}</p>
          </div>
          <button onClick={onClose} className="text-admin-text-sub hover:text-admin-navy">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Original review snippet */}
        <div className="bg-admin-seafoam rounded-[10px] px-3 py-2.5 mb-4 text-[12px] text-admin-text-sub italic">
          "{review.body}"
        </div>

        <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
          Your Reply
        </label>
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a helpful, professional response…"
          className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none focus:border-admin-navy resize-none mb-4"
        />

        <div className="flex gap-2">
          <AdminBtn variant="secondary" onClick={onClose} className="flex-1 justify-center">
            Cancel
          </AdminBtn>
          <AdminBtn
            variant="primary"
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            className="flex-1 justify-center"
            icon="send"
          >
            {submitting ? 'Sending…' : 'Send Reply'}
          </AdminBtn>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminReviews() {
  const { addToast } = useToastStore()

  // Reviews are moved into local state so mutations are immediately reflected
  // in the list without a page reload.
  const [reviews, setReviews] = useState(ADMIN_REVIEWS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [replyTarget, setReplyTarget] = useState(null) // review object for reply modal

  const filtered = reviews.filter((r) => {
    const matchSearch =
      !search ||
      r.author.toLowerCase().includes(search.toLowerCase()) ||
      r.product.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const pending = reviews.filter((r) => r.status === 'pending').length
  const flagged = reviews.filter((r) => r.status === 'flagged').length

  // ── Action Handlers ─────────────────────────────────────────────────────────

  /** Approve a pending review → published */
  const handleApprove = (reviewId) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'published' } : r))
    )
    addToast({ message: 'Review approved and published.', type: 'success' })
  }

  /** Reject a pending review → flagged */
  const handleReject = (reviewId, authorName) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'flagged' } : r))
    )
    addToast({ message: `Review by ${authorName} flagged for removal.`, type: 'info' })
  }

  /** Keep a flagged review → published (override flag) */
  const handleKeep = (reviewId) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'published' } : r))
    )
    addToast({ message: 'Review kept and re-published.', type: 'success' })
  }

  /** Remove / Delete a review entirely */
  const handleDelete = (reviewId, authorName) => {
    if (!window.confirm(`Permanently delete the review by ${authorName}?`)) return
    setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    addToast({ message: `Review by ${authorName} deleted.`, type: 'info' })
  }

  /** Submit a reply to a review */
  const handleReplySubmit = (replyText) => {
    // In production: POST /api/reviews/:id/reply with replyText
    // Here we store the reply on the local review object for immediate feedback
    setReviews((prev) =>
      prev.map((r) =>
        r.id === replyTarget.id ? { ...r, adminReply: replyText } : r
      )
    )
    addToast({ message: 'Reply sent successfully.', type: 'success' })
    setReplyTarget(null)
  }

  return (
    <AdminPage>
      {/* Reply Modal */}
      {replyTarget && (
        <ReplyModal
          review={replyTarget}
          onClose={() => setReplyTarget(null)}
          onSubmit={handleReplySubmit}
        />
      )}

      {/* Alert banners for pending / flagged */}
      {(pending > 0 || flagged > 0) && (
        <div className="flex flex-wrap gap-3 mb-5">
          {pending > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-[12px]">
              <span className="material-symbols-outlined text-yellow-600" style={{ fontSize: '18px' }}>pending</span>
              <p className="text-[13px] font-semibold text-yellow-800">
                {pending} review{pending > 1 ? 's' : ''} awaiting moderation
              </p>
              <AdminBtn size="sm" variant="secondary" onClick={() => setStatusFilter('pending')}>
                Review
              </AdminBtn>
            </div>
          )}
          {flagged > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-[12px]">
              <span className="material-symbols-outlined text-red-600" style={{ fontSize: '18px' }}>flag</span>
              <p className="text-[13px] font-semibold text-red-800">{flagged} flagged for removal</p>
              <AdminBtn size="sm" variant="secondary" onClick={() => setStatusFilter('flagged')}>
                View
              </AdminBtn>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-5">
        <AdminInput
          id="reviews-search"
          placeholder="Search author, product, title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon="search"
          className="w-64"
        />
        <FilterBar
          options={['all', 'published', 'pending', 'flagged']}
          active={statusFilter}
          onSelect={setStatusFilter}
        />
      </div>

      <AdminCard subtitle={`${filtered.length} review${filtered.length !== 1 ? 's' : ''}`}>
        <AdminTable headers={['Author', 'Product', 'Rating', 'Review', 'Date', 'Verified', 'Status', 'Actions']}>
          {filtered.map((r) => (
            <Tr key={r.id}>
              {/* Author */}
              <Td>
                <div className="flex items-center gap-2">
                  <Avatar name={r.author} size="sm" />
                  <span className="font-semibold text-[12px]">{r.author}</span>
                </div>
              </Td>

              {/* Product */}
              <Td><span className="text-[12px]">{r.product}</span></Td>

              {/* Rating */}
              <Td><StarRow rating={r.rating} /></Td>

              {/* Review text */}
              <Td>
                <div className="max-w-[200px]">
                  <p className="font-semibold text-[12px] text-admin-navy truncate">{r.title}</p>
                  <p className="text-[11px] text-admin-text-sub truncate">{r.body}</p>
                  {r.adminReply && (
                    <p className="text-[10px] text-admin-success mt-0.5 truncate">
                      ✓ Reply sent
                    </p>
                  )}
                </div>
              </Td>

              {/* Date */}
              <Td><span className="text-[11px]">{formatDate(r.date)}</span></Td>

              {/* Verified */}
              <Td>
                {r.verified
                  ? <span className="material-symbols-outlined text-admin-success" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>verified</span>
                  : <span className="material-symbols-outlined text-admin-text-sub" style={{ fontSize: '16px' }}>remove_done</span>
                }
              </Td>

              {/* Status */}
              <Td><StatusBadge status={r.status} /></Td>

              {/* Actions — all buttons wired with onClick handlers */}
              <Td>
                <div className="flex gap-1 flex-wrap">
                  {/* Pending: Approve or Reject */}
                  {r.status === 'pending' && (
                    <>
                      <AdminBtn
                        size="sm"
                        variant="primary"
                        icon="check"
                        onClick={() => handleApprove(r.id)}
                      >
                        Approve
                      </AdminBtn>
                      <AdminBtn
                        size="sm"
                        variant="danger"
                        icon="flag"
                        onClick={() => handleReject(r.id, r.author)}
                      >
                        Reject
                      </AdminBtn>
                    </>
                  )}

                  {/* Flagged: Keep or Delete */}
                  {r.status === 'flagged' && (
                    <>
                      <AdminBtn
                        size="sm"
                        variant="secondary"
                        icon="check"
                        onClick={() => handleKeep(r.id)}
                      >
                        Keep
                      </AdminBtn>
                      <AdminBtn
                        size="sm"
                        variant="danger"
                        icon="delete"
                        onClick={() => handleDelete(r.id, r.author)}
                      >
                        Delete
                      </AdminBtn>
                    </>
                  )}

                  {/* Published: Reply + Remove */}
                  {r.status === 'published' && (
                    <>
                      <AdminBtn
                        size="sm"
                        variant="secondary"
                        icon="reply"
                        onClick={() => setReplyTarget(r)}
                      >
                        Reply
                      </AdminBtn>
                      <AdminBtn
                        size="sm"
                        variant="danger"
                        icon="delete"
                        onClick={() => handleDelete(r.id, r.author)}
                      >
                        Remove
                      </AdminBtn>
                    </>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      </AdminCard>
    </AdminPage>
  )
}
