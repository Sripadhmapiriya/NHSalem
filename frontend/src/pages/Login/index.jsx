import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useAuthStore from '@/store/authStore'
import useToastStore from '@/store/toastStore'
import { loginWithEmail, loginWithPhone } from '@/services/api'

// ── Validation schemas ────────────────────────────────────────────────────────

const emailSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const phoneSchema = z.object({
  phone:    z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  password: z.string().min(1, 'Password is required'),
})

// ── Sub-components ────────────────────────────────────────────────────────────

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 text-[13px] font-bold rounded-full transition-all duration-200 ${
        active
          ? 'text-white shadow-sm'
          : 'text-on-surface-variant hover:text-on-surface'
      }`}
      style={active ? { background: 'linear-gradient(135deg, #0B4F3C, #0f6b52)' } : {}}
    >
      {children}
    </button>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return (
    <p role="alert" className="flex items-center gap-1 mt-1.5 pl-1 text-[12px] font-medium text-red-600">
      <span className="material-symbols-outlined" style={{ fontSize: '13px' }} aria-hidden="true">error</span>
      {message}
    </p>
  )
}

// ── Email + Password form ─────────────────────────────────────────────────────

function EmailForm({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()
  const { addToast } = useToastStore()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    setServerError('')
    const result = await loginWithEmail(email, password)
    setLoading(false)
    if (result.success) {
      setUser(result.user, result.token)
      addToast({ message: `Welcome back, ${result.user.name}! 🎉`, type: 'success' })
      onSuccess?.()
    } else {
      setServerError(result.message)
    }
  }

  const inputCls = (hasError) =>
    `flex-1 bg-transparent text-sm font-medium text-on-surface placeholder:text-outline/70 focus:outline-none disabled:opacity-60 ${hasError ? 'text-red-700' : ''}`

  const wrapCls = (hasError) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-full border bg-surface-container-low transition-all duration-150 ${
      hasError
        ? 'border-red-400 ring-2 ring-red-400/20'
        : 'border-outline-variant focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'
    }`

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Email */}
      <div>
        <label htmlFor="email-login-email" className="block text-label-md font-semibold text-on-surface mb-1.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className={wrapCls(!!errors.email)}>
          <span className="material-symbols-outlined text-outline flex-shrink-0 leading-none" style={{ fontSize: '18px' }}>
            alternate_email
          </span>
          <input
            id="email-login-email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            disabled={loading}
            {...register('email')}
            className={inputCls(!!errors.email)}
          />
        </div>
        <FieldError message={errors.email?.message} />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="email-login-password" className="text-label-md font-semibold text-on-surface">
            Password <span className="text-red-500">*</span>
          </label>
          <a href="/help" className="text-label-sm text-primary hover:underline">
            Forgot password?
          </a>
        </div>
        <div className={wrapCls(!!errors.password)}>
          <span className="material-symbols-outlined text-outline flex-shrink-0 leading-none" style={{ fontSize: '18px' }}>
            lock
          </span>
          <input
            id="email-login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={loading}
            {...register('password')}
            className={inputCls(!!errors.password)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="text-outline hover:text-on-surface transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined leading-none" style={{ fontSize: '18px' }}>
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        <FieldError message={errors.password?.message} />
      </div>

      {/* Server Error */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2.5 px-4 py-3 rounded-[12px] bg-red-50 border border-red-200"
          >
            <span className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5" style={{ fontSize: '16px' }}>warning</span>
            <p className="text-[12px] font-medium text-red-700 leading-snug">{serverError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm text-white tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #0B4F3C, #0f6b52)', boxShadow: '0 4px 20px rgba(11,79,60,0.35)' }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            Sign In with Email
            <span className="material-symbols-outlined leading-none" style={{ fontSize: '16px' }}>arrow_forward</span>
          </>
        )}
      </button>

      {/* Demo hint */}
      <p className="text-center text-[11px] text-on-surface-variant bg-surface-container-low rounded-[10px] p-2.5">
        <span className="font-semibold">Demo:</span> user@nhsalem.com / password123
      </p>
    </form>
  )
}

// ── Phone + Password form ─────────────────────────────────────────────────────

function PhoneForm({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()
  const { addToast } = useToastStore()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '', password: '' },
  })

  const onSubmit = async ({ phone, password }) => {
    setLoading(true)
    setServerError('')
    const result = await loginWithPhone(phone, password)
    setLoading(false)
    if (result.success) {
      setUser(result.user, result.token)
      addToast({ message: `Welcome back, ${result.user.name}! 🎉`, type: 'success' })
      onSuccess?.()
    } else {
      setServerError(result.message)
    }
  }

  const inputCls = (hasError) =>
    `flex-1 bg-transparent text-sm font-medium text-on-surface placeholder:text-outline/70 focus:outline-none disabled:opacity-60 ${hasError ? 'text-red-700' : ''}`

  const wrapCls = (hasError) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-full border bg-surface-container-low transition-all duration-150 ${
      hasError
        ? 'border-red-400 ring-2 ring-red-400/20'
        : 'border-outline-variant focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'
    }`

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Phone */}
      <div>
        <label htmlFor="phone-login-phone" className="block text-label-md font-semibold text-on-surface mb-1.5">
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <div className={wrapCls(!!errors.phone)}>
          <span className="flex items-center px-2 border-r border-outline-variant text-sm text-on-surface-variant flex-shrink-0 mr-1">
            +91
          </span>
          <input
            id="phone-login-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            disabled={loading}
            {...register('phone', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)
              },
            })}
            className={inputCls(!!errors.phone)}
          />
        </div>
        <FieldError message={errors.phone?.message} />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="phone-login-password" className="text-label-md font-semibold text-on-surface">
            Password <span className="text-red-500">*</span>
          </label>
          <a href="/help" className="text-label-sm text-primary hover:underline">
            Forgot password?
          </a>
        </div>
        <div className={wrapCls(!!errors.password)}>
          <span className="material-symbols-outlined text-outline flex-shrink-0 leading-none" style={{ fontSize: '18px' }}>
            lock
          </span>
          <input
            id="phone-login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={loading}
            {...register('password')}
            className={inputCls(!!errors.password)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="text-outline hover:text-on-surface transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined leading-none" style={{ fontSize: '18px' }}>
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        <FieldError message={errors.password?.message} />
      </div>

      {/* Server Error */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2.5 px-4 py-3 rounded-[12px] bg-red-50 border border-red-200"
          >
            <span className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5" style={{ fontSize: '16px' }}>warning</span>
            <p className="text-[12px] font-medium text-red-700 leading-snug">{serverError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm text-white tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #0B4F3C, #0f6b52)', boxShadow: '0 4px 20px rgba(11,79,60,0.35)' }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            Sign In with Phone
            <span className="material-symbols-outlined leading-none" style={{ fontSize: '16px' }}>arrow_forward</span>
          </>
        )}
      </button>

      {/* Demo hint */}
      <p className="text-center text-[11px] text-on-surface-variant bg-surface-container-low rounded-[10px] p-2.5">
        <span className="font-semibold">Demo:</span> phone 9876543210 / password123
      </p>
    </form>
  )
}

// ── Main Login Page ───────────────────────────────────────────────────────────

/**
 * User Login Page — /login
 *
 * Supports two login methods toggled by a tab:
 *   a) Email + Password
 *   b) Phone Number + Password
 *
 * Both methods include:
 *   - Input validation (email format, phone format, password required)
 *   - Show/hide password toggle
 *   - "Forgot Password?" link (routes to /help placeholder)
 *   - Error message display on failed login
 *   - Toast + redirect to / on successful login
 *
 * Props:
 *   isModal  — if true, renders compact layout without outer padding (for use in login modal)
 *   onSuccess — callback when auth succeeds (closes modal)
 */
export default function LoginPage({ isModal = false, onSuccess }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('email') // 'email' | 'phone'

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    } else {
      navigate('/', { replace: true })
    }
  }

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="w-20 h-20 bg-black rounded-full overflow-hidden flex items-center justify-center border border-outline-variant/30 shadow-sm mx-auto mb-4 p-2">
          <img
            src="/crest.jpg"
            alt="NH Salem Sea Foods Crest"
            className="w-full h-full object-contain"
          />
        </div>
        {!isModal && (
          <>
            <h1 className="font-serif text-3xl font-extrabold text-primary tracking-tight">NH Salem</h1>
            <span className="mt-1 text-[10px] font-bold tracking-[0.22em] uppercase text-on-surface-variant block">
              Sea Foods
            </span>
            <p className="text-body-md text-on-surface-variant mt-3">
              Sign in to track orders, manage subscriptions, and get catch updates.
            </p>
          </>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex bg-surface-container-low rounded-full p-1 border border-outline-variant/40">
        <TabButton active={activeTab === 'email'} onClick={() => setActiveTab('email')}>
          <span className="material-symbols-outlined mr-1 align-middle" style={{ fontSize: '14px' }}>alternate_email</span>
          Email
        </TabButton>
        <TabButton active={activeTab === 'phone'} onClick={() => setActiveTab('phone')}>
          <span className="material-symbols-outlined mr-1 align-middle" style={{ fontSize: '14px' }}>phone</span>
          Phone
        </TabButton>
      </div>

      {/* Animated form panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'email' ? (
          <motion.div
            key="email-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18 }}
          >
            <EmailForm onSuccess={handleSuccess} />
          </motion.div>
        ) : (
          <motion.div
            key="phone-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18 }}
          >
            <PhoneForm onSuccess={handleSuccess} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer links */}
      <p className="text-label-sm text-on-surface-variant text-center">
        By continuing, you agree to our{' '}
        <a href="/help" className="text-primary hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="/help" className="text-primary hover:underline">Privacy Policy</a>.
      </p>
    </div>
  )

  if (isModal) return content

  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-[28px] shadow-stat p-8">
        {content}
      </div>
    </div>
  )
}
