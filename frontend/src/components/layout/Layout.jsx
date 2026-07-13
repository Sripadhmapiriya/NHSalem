import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './Header'
import Footer from './Footer'
import ToastContainer from '@/components/ui/Toast'
import Modal from '@/components/ui/Modal'
import LoginPage from '@/pages/Login'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
}

/**
 * Layout — wraps every route with Header + Footer + Toast
 * Manages the global Login modal state
 */
export default function Layout({ children }) {
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onLoginClick={() => setLoginModalOpen(true)} />

      <main className="flex-1" id="main-content" tabIndex={-1}>
        <motion.div
          key={typeof window !== 'undefined' ? window.location.pathname : 'page'}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>

      <Footer />

      {/* Global Login Modal */}
      <Modal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        title="Welcome to NH Salem"
        id="login-modal"
        size="sm"
      >
        <LoginPage
          isModal
          onSuccess={() => setLoginModalOpen(false)}
        />
      </Modal>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  )
}
