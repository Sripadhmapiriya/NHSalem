import React, { useState, useEffect, useRef } from 'react'
import { AdminPage, AdminCard, AdminTable, Tr, Td, StatusBadge, AdminBtn, Pagination, AdminInput } from '@/admin/AdminUI'
import { SeafoodLoader } from '@/components/ui'
import Modal from '@/components/ui/Modal'
import useToastStore from '@/store/toastStore'
import { getAdminMessages, updateAdminMessageStatus, deleteAdminMessage, getWhatsappMessages, sendWhatsappMessage } from '@/services/adminApi'

export default function AdminMessages() {
  const { addToast } = useToastStore()
  
  // Tabs: 'web' | 'whatsapp'
  const [activeTab, setActiveTab] = useState('whatsapp')
  
  // --- Web Messages State ---
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null })

  // --- WhatsApp State ---
  const [waMessages, setWaMessages] = useState([])
  const [waLoading, setWaLoading] = useState(true)
  const [activeWaPhone, setActiveWaPhone] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (activeTab === 'web') fetchMessages()
    if (activeTab === 'whatsapp') fetchWaMessages()
  }, [activeTab])

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'whatsapp' && activeWaPhone) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [waMessages, activeWaPhone, activeTab])

  // --- Web Messages Methods ---
  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await getAdminMessages()
      if (res.success) setMessages(res.messages)
    } catch (err) {
      addToast({ message: 'Failed to load web messages', type: 'error' })
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

  const confirmDelete = (id) => setDeleteModal({ isOpen: true, id })

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

  // --- WhatsApp Methods ---
  const fetchWaMessages = async () => {
    setWaLoading(true)
    try {
      const res = await getWhatsappMessages()
      setWaMessages(res || [])
    } catch (err) {
      addToast({ message: 'Failed to load WhatsApp messages', type: 'error' })
    } finally {
      setWaLoading(false)
    }
  }

  const handleSendWaReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !activeWaPhone) return
    
    setSendingReply(true)
    try {
      const sent = await sendWhatsappMessage(activeWaPhone, replyText)
      setWaMessages(prev => [sent, ...prev])
      setReplyText('')
    } catch (err) {
      addToast({ message: 'Failed to send WhatsApp reply', type: 'error' })
    } finally {
      setSendingReply(false)
    }
  }

  // Group WA messages by phone number
  const waConversations = waMessages.reduce((acc, m) => {
    if (!acc[m.customer_phone]) acc[m.customer_phone] = []
    acc[m.customer_phone].push(m)
    return acc
  }, {})
  
  // Sort conversations by latest message
  const sortedWaPhones = Object.keys(waConversations).sort((a, b) => {
    const latestA = new Date(waConversations[a][0].created_at).getTime()
    const latestB = new Date(waConversations[b][0].created_at).getTime()
    return latestB - latestA
  })

  const activeConversation = activeWaPhone ? waConversations[activeWaPhone] : null

  return (
    <AdminPage>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-admin-navy">Messages</h1>
          <p className="text-sm text-admin-text-sub mt-1">Manage customer inquiries</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-white rounded-[10px] p-1 border border-admin-border/60 shadow-sm self-start">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2 rounded-[8px] text-sm font-bold transition-all ${activeTab === 'whatsapp' ? 'bg-admin-seafoam text-admin-navy shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'text-admin-text-sub hover:text-admin-navy'}`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('web')}
            className={`px-4 py-2 rounded-[8px] text-sm font-bold transition-all ${activeTab === 'web' ? 'bg-admin-seafoam text-admin-navy shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'text-admin-text-sub hover:text-admin-navy'}`}
          >
            Web Inquiries
          </button>
        </div>
      </div>

      {activeTab === 'web' && (
        <AdminCard subtitle={`${filtered.length} message${filtered.length !== 1 ? 's' : ''}`}>
          <div className="flex gap-1.5 flex-wrap px-5 pt-4 pb-2 border-b border-admin-border/40">
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

          {loading ? (
            <SeafoodLoader text="Loading messages..." className="py-8" />
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-admin-text-sub/50 mb-3 block">forum</span>
              <h3 className="text-lg font-bold text-admin-navy">No messages found</h3>
            </div>
          ) : (
            <>
              <AdminTable headers={['Date', 'Sender', 'Contact Info', 'Message', 'Status', 'Actions']}>
                {paginated.map((m) => (
                  <Tr key={m.id} className={m.status === 'unread' ? 'bg-admin-seafoam/20' : ''}>
                    <Td><span className="text-xs text-admin-text-sub">{new Date(m.created_at).toLocaleDateString()}</span></Td>
                    <Td><span className="font-bold text-admin-navy text-sm">{m.name}</span></Td>
                    <Td><span className="text-sm text-admin-text">{m.contact}</span></Td>
                    <Td><div className="max-w-[250px] text-sm text-admin-text whitespace-pre-wrap">{m.message}</div></Td>
                    <Td><StatusBadge status={m.status} /></Td>
                    <Td>
                      <div className="flex gap-1 flex-wrap">
                        {m.status === 'unread' && <AdminBtn size="sm" variant="primary" icon="mark_email_read" onClick={() => handleUpdateStatus(m.id, 'read')}>Read</AdminBtn>}
                        {m.status === 'read' && <AdminBtn size="sm" variant="secondary" icon="archive" onClick={() => handleUpdateStatus(m.id, 'archived')}>Archive</AdminBtn>}
                        {m.status === 'archived' && <AdminBtn size="sm" variant="secondary" icon="unarchive" onClick={() => handleUpdateStatus(m.id, 'read')}>Unarchive</AdminBtn>}
                        <AdminBtn size="sm" variant="secondary" icon="delete" onClick={() => confirmDelete(m.id)}>Delete</AdminBtn>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </AdminTable>
              <Pagination currentPage={currentPage} totalItems={filtered.length} itemsPerPage={10} onPageChange={setCurrentPage} />
            </>
          )}
        </AdminCard>
      )}

      {activeTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] h-[calc(100vh-200px)] min-h-[500px] bg-white rounded-[16px] border border-admin-border/60 shadow-[0_2px_12px_rgba(11,30,61,0.06)] overflow-hidden">
          
          {/* WA Sidebar (Conversations List) */}
          <div className="border-r border-admin-border/60 flex flex-col h-full bg-admin-seafoam/20">
            <div className="p-4 border-b border-admin-border/60 bg-white">
              <h2 className="font-bold text-admin-navy">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {waLoading ? (
                <div className="p-8 text-center text-admin-text-sub text-sm">Loading...</div>
              ) : sortedWaPhones.length === 0 ? (
                <div className="p-8 text-center text-admin-text-sub text-sm">No WhatsApp messages yet.</div>
              ) : (
                sortedWaPhones.map(phone => {
                  const msgs = waConversations[phone]
                  const latest = msgs[0]
                  return (
                    <div 
                      key={phone} 
                      onClick={() => setActiveWaPhone(phone)}
                      className={`p-4 border-b border-admin-border/40 cursor-pointer transition-colors ${activeWaPhone === phone ? 'bg-admin-seafoam' : 'hover:bg-admin-seafoam/50'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[13px] text-admin-navy">{phone}</span>
                        <span className="text-[10px] text-admin-text-sub">{new Date(latest.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-[12px] text-admin-text-sub truncate">{latest.direction === 'outbound' ? 'You: ' : ''}{latest.message_text}</p>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* WA Main Chat Area */}
          <div className="flex flex-col h-full bg-white">
            {activeWaPhone ? (
              <>
                <div className="p-4 border-b border-admin-border/60 flex items-center justify-between shadow-sm z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-admin-navy">{activeWaPhone}</h3>
                      <p className="text-[11px] text-[#25D366] font-bold tracking-wide">WhatsApp Business API</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 bg-[#E5DDD5]/10 flex flex-col-reverse gap-3">
                  <div ref={messagesEndRef} />
                  {activeConversation?.map(m => {
                    const isOutbound = m.direction === 'outbound'
                    return (
                      <div key={m.id} className={`flex flex-col max-w-[75%] ${isOutbound ? 'self-end' : 'self-start'}`}>
                        <div className={`p-3 rounded-2xl shadow-sm text-[13px] ${isOutbound ? 'bg-[#D9FDD3] rounded-tr-none text-black' : 'bg-white rounded-tl-none text-black border border-admin-border/50'}`}>
                          {m.message_text}
                        </div>
                        <span className={`text-[10px] text-admin-text-sub mt-1 ${isOutbound ? 'text-right' : 'text-left'}`}>
                          {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="p-4 bg-[#F0F2F5] border-t border-admin-border/60">
                  <form onSubmit={handleSendWaReply} className="flex gap-2">
                    <input 
                      type="text" 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type a message..." 
                      className="flex-1 px-4 py-2.5 rounded-full border border-admin-border focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]/50 text-[13px]"
                      disabled={sendingReply}
                    />
                    <button 
                      type="submit" 
                      disabled={!replyText.trim() || sendingReply}
                      className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center disabled:opacity-50 hover:bg-[#20bd5a] transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
                    </button>
                  </form>
                  <p className="text-[10px] text-admin-text-sub text-center mt-2">
                    Replies must be within 24 hours of the customer's last message as per Meta's policy.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-admin-text-sub">
                <span className="material-symbols-outlined text-[64px] text-admin-text-sub/20 mb-4">forum</span>
                <p>Select a conversation to view direct messages</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Web */}
      <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, id: null })} title="Delete Message" size="sm">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4 text-admin-navy">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-red-600 text-2xl">delete_forever</span>
            </div>
            <p className="text-sm font-medium">Are you sure you want to permanently delete this message? This action cannot be undone.</p>
          </div>
          <div className="flex gap-3 justify-end mt-8">
            <button onClick={() => setDeleteModal({ isOpen: false, id: null })} className="px-4 py-2 rounded-lg text-sm font-bold text-admin-text-sub bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700">Yes, Delete</button>
          </div>
        </div>
      </Modal>
    </AdminPage>
  )
}
