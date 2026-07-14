import { useState, useEffect } from 'react'
import useToastStore from '@/store/toastStore'
import { getAdminReviews, updateAdminReviewStatus, deleteAdminReview } from '@/services/adminApi'
import {
  AdminPage,
  AdminCard,
  AdminTable,
  Tr,
  Td,
  StatusBadge,
  AdminBtn,
  AdminInput,
  Pagination,
} from '@/admin/AdminUI'
import { SeafoodLoader } from '@/components/ui'

function ReplyModal({ review, onClose, onSubmit }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      onSubmit(text)
      setSubmitting(false)
    }, 600)
  }

  return (
    <div className="fixed inset-0 bg-admin-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[16px] w-full max-w-md border border-admin-border/80 shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-admin-seafoam border-b border-admin-border/50 flex justify-between items-center">
          <h3 className="font-bold text-admin-navy text-[14px]">Reply to Review</h3>
          <button onClick={onClose} className="material-symbols-outlined text-admin-text-sub hover:text-admin-navy" style={{ fontSize: '18px' }}>close</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-admin-seafoam/50 p-3 rounded-[10px] text-[12px] border border-admin-border/30">
            <p className="font-semibold text-admin-navy mb-1">{review.author} on {review.product}</p>
            <p className="text-admin-text-sub italic">"{review.body}"</p>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Your Response</label>
            <textarea
              required
              rows={4}
              placeholder="Type your official reply here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy focus:ring-1 focus:ring-admin-navy/20 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <AdminBtn variant="secondary" onClick={onClose} size="sm">Cancel</AdminBtn>
            <AdminBtn type="submit" variant="primary" size="sm" disabled={!text.trim() || submitting} icon="send">
              {submitting ? 'Sending…' : 'Send Reply'}
            </AdminBtn>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminReviews() {
  const { addToast } = useToastStore()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [replyTarget, setReplyTarget] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const res = await getAdminReviews()
      if (res.success) {
        setReviews(res.reviews)
      }
    } catch (err) {
      console.error(err)
      addToast({ message: 'Failed to load reviews', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Reset to first page on search or filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const filtered = reviews.filter((r) => {
    const matchSearch =
      !search ||
      r.author.toLowerCase().includes(search.toLowerCase()) ||
      r.product.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  // Paginate reviews
  const paginated = filtered.slice((currentPage - 1) * 10, currentPage * 10)

  const pending = reviews.filter((r) => r.status === 'pending').length
  const flagged = reviews.filter((r) => r.status === 'flagged').length

  const handleApprove = async (reviewId) => {
    try {
      await updateAdminReviewStatus(reviewId, 'published')
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: 'published' } : r))
      )
      addToast({ message: 'Review approved and published.', type: 'success' })
    } catch (err) {
      addToast({ message: err.message || 'Failed to approve review', type: 'error' })
    }
  }

  const handleReject = async (reviewId, authorName) => {
    try {
      await updateAdminReviewStatus(reviewId, 'flagged')
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: 'flagged' } : r))
      )
      addToast({ message: `Review by ${authorName} flagged for removal.`, type: 'info' })
    } catch (err) {
      addToast({ message: err.message || 'Failed to reject review', type: 'error' })
    }
  }

  const handleKeep = async (reviewId) => {
    try {
      await updateAdminReviewStatus(reviewId, 'published')
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: 'published' } : r))
      )
      addToast({ message: 'Review kept and re-published.', type: 'success' })
    } catch (err) {
      addToast({ message: err.message || 'Failed to update review status', type: 'error' })
    }
  }

  const handleDelete = async (reviewId, authorName) => {
    if (!window.confirm(`Permanently delete the review by ${authorName}?`)) return
    try {
      await deleteAdminReview(reviewId)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      addToast({ message: `Review by ${authorName} deleted.`, type: 'info' })
    } catch (err) {
      addToast({ message: err.message || 'Failed to delete review', type: 'error' })
    }
  }

  const handleReplySubmit = (replyText) => {
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

      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
          <p className="text-2xl font-bold text-admin-navy">{reviews.length}</p>
          <p className="text-[11px] text-admin-text-sub mt-0.5">Total Reviews</p>
        </div>
        <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
          <p className="text-2xl font-bold text-admin-gold">{pending}</p>
          <p className="text-[11px] text-admin-text-sub mt-0.5">Pending Approval</p>
        </div>
        <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
          <p className="text-2xl font-bold text-admin-coral">{flagged}</p>
          <p className="text-[11px] text-admin-text-sub mt-0.5">Flagged / Rejected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <AdminInput
          id="reviews-search"
          placeholder="Search author, product, comment…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon="search"
          className="w-64"
        />
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'pending', 'published', 'flagged'].map((status) => {
            const count = status === 'pending' ? pending : status === 'flagged' ? flagged : status === 'published' ? reviews.filter(r => r.status === 'published').length : reviews.length
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                  statusFilter === status
                    ? 'bg-admin-navy border-admin-navy text-white shadow-sm'
                    : 'bg-white border-admin-border text-admin-text-sub hover:border-admin-navy/40'
                }`}
              >
                <span className="capitalize">{status}</span>
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] ${statusFilter === status ? 'bg-white/20 text-white' : 'bg-admin-seafoam text-admin-text'}`}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <AdminCard subtitle={`${filtered.length} review${filtered.length !== 1 ? 's' : ''}`}>
        {loading ? (
          <SeafoodLoader text="Loading reviews..." className="py-8" />
        ) : (
          <>
            <AdminTable headers={['Product', 'Reviewer', 'Rating', 'Review Details', 'Status', 'Actions']}>
              {paginated.map((r) => (
                <Tr key={r.id}>
                  <Td><span className="font-semibold text-admin-navy">{r.product}</span></Td>
                  <Td>
                    <div>
                      <p className="font-semibold">{r.author}</p>
                      <p className="text-[10px] text-admin-text-sub">{r.date}</p>
                    </div>
                  </Td>
                  <Td>
                    <span className="flex items-center gap-0.5 font-bold text-admin-navy">
                      {r.rating}
                      <span className="material-symbols-outlined text-admin-gold" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                    </span>
                  </Td>
                  <Td>
                    <div className="max-w-[280px]">
                      <p className="font-bold text-[12px] text-admin-navy">{r.title}</p>
                      <p className="text-[11px] text-admin-text-sub leading-relaxed mt-0.5">{r.body}</p>
                      {r.adminReply && (
                        <div className="mt-2 pl-2.5 border-l-2 border-admin-gold text-[10px] text-admin-navy bg-admin-seafoam/40 py-1 rounded-r">
                          <span className="font-bold">Official Response:</span> "{r.adminReply}"
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td>
                    <div className="flex gap-1">
                      {r.status === 'pending' && (
                        <>
                          <AdminBtn size="sm" variant="primary" icon="check" onClick={() => handleApprove(r.id)}>Approve</AdminBtn>
                          <AdminBtn size="sm" variant="secondary" icon="close" onClick={() => handleReject(r.id, r.author)}>Reject</AdminBtn>
                        </>
                      )}
                      {r.status === 'flagged' && (
                        <AdminBtn size="sm" variant="primary" icon="check" onClick={() => handleKeep(r.id)}>Keep / Restore</AdminBtn>
                      )}
                      {r.status === 'published' && (
                        <AdminBtn size="sm" variant="secondary" icon="reply" onClick={() => setReplyTarget(r)}>Reply</AdminBtn>
                      )}
                      <AdminBtn size="sm" variant="secondary" icon="delete" onClick={() => handleDelete(r.id, r.author)}>Delete</AdminBtn>
                    </div>
                  </Td>
                </Tr>
              ))}
            </AdminTable>
            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              itemsPerPage={10}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </AdminCard>
    </AdminPage>
  )
}
