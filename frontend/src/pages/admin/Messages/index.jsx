import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminPage, AdminCard, AdminTable, Tr, Td, StatusBadge, AdminBtn, Pagination } from '@/admin/AdminUI'
import { SeafoodLoader } from '@/components/ui'
import Modal from '@/components/ui/Modal'
import useToastStore from '@/store/toastStore'
import { getAdminMessages, updateAdminMessageStatus, deleteAdminMessage } from '@/services/adminApi'

export default function AdminMessages() {
  const { addToast } = useToastStore()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await getAdminMessages()
      if (res.success) {
        setMessages(res.messages)
      }
    } catch (err) {
      addToast({ message: 'Failed to load messages', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateAdminMessageStatus(id, status)
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m))
      addToast({ message: `Message marked as ${status}`, type: 'success' })
    } catch (err) {
      addToast({ message: 'Failed to update status', type: 'error' })
    }
  }

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null })

  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, id })
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    const id = deleteModal.id
    setDeleteModal({ isOpen: false, id: null })
    try {
      await deleteAdminMessage(id)
      setMessages(prev => prev.filter(m => m.id !== id))
      addToast({ message: 'Message deleted', type: 'info' })
    } catch (err) {
      addToast({ message: 'Failed to delete message', type: 'error' })
    }
  }

  const filtered = messages.filter(m => statusFilter === 'all' || m.status === statusFilter)
  const paginated = filtered.slice((currentPage - 1) * 10, currentPage * 10)

  return (
    <AdminPage>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-admin-navy">Direct Messages</h1>
          <p className="text-sm text-admin-text-sub mt-1">Manage inquiries and contact submissions</p>
        </div>
        
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'unread', 'read', 'archived'].map((status) => {
            const count = status === 'all' ? messages.length : messages.filter(m => m.status === status).length
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

      <AdminCard subtitle={`${filtered.length} message${filtered.length !== 1 ? 's' : ''}`}>
        {loading ? (
          <SeafoodLoader text="Loading messages..." className="py-8" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-admin-text-sub/50 mb-3 block">forum</span>
            <h3 className="text-lg font-bold text-admin-navy">No messages found</h3>
            <p className="text-sm text-admin-text-sub mt-1">You don't have any messages in this category.</p>
          </div>
        ) : (
          <>
            <AdminTable headers={['Date', 'Sender', 'Contact Info', 'Message', 'Status', 'Actions']}>
              {paginated.map((m) => (
                <Tr key={m.id} className={m.status === 'unread' ? 'bg-admin-seafoam/20' : ''}>
                  <Td>
                    <span className="text-xs text-admin-text-sub">
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-bold text-admin-navy text-sm">{m.name}</span>
                  </Td>
                  <Td>
                    <span className="text-sm text-admin-text">{m.contact}</span>
                  </Td>
                  <Td>
                    <div className="max-w-[250px] text-sm text-admin-text whitespace-pre-wrap">
                      {m.message}
                    </div>
                  </Td>
                  <Td>
                    <StatusBadge status={m.status} />
                  </Td>
                  <Td>
                    <div className="flex gap-1 flex-wrap">
                      {m.status === 'unread' && (
                        <AdminBtn size="sm" variant="primary" icon="mark_email_read" onClick={() => handleUpdateStatus(m.id, 'read')}>Read</AdminBtn>
                      )}
                      {m.status === 'read' && (
                        <AdminBtn size="sm" variant="secondary" icon="archive" onClick={() => handleUpdateStatus(m.id, 'archived')}>Archive</AdminBtn>
                      )}
                      {m.status === 'archived' && (
                        <AdminBtn size="sm" variant="secondary" icon="unarchive" onClick={() => handleUpdateStatus(m.id, 'read')}>Unarchive</AdminBtn>
                      )}
                      <AdminBtn size="sm" variant="secondary" icon="delete" onClick={() => confirmDelete(m.id)}>Delete</AdminBtn>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Message"
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4 text-admin-navy">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-red-600 text-2xl">delete_forever</span>
            </div>
            <p className="text-sm font-medium">Are you sure you want to permanently delete this message? This action cannot be undone.</p>
          </div>
          <div className="flex gap-3 justify-end mt-8">
            <button
              onClick={() => setDeleteModal({ isOpen: false, id: null })}
              className="px-4 py-2 rounded-lg text-sm font-bold text-admin-text-sub bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </AdminPage>
  )
}
