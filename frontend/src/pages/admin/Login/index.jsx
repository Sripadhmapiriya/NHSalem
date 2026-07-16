import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import useAdminAuthStore from '@/store/adminAuthStore'
import { adminLogin } from '@/services/adminApi'

const schema = z.object({
  email: z.string().email('Enter a valid institutional email'),
  password: z.string().min(1, 'Security key is required'),
  rememberDevice: z.boolean().optional(),
})

/**
 * Admin Login Page
 * Route: /admin/login
 * Design: "Premium Nautical" — Deep Navy background, white card, Brass/Gold accents
 */
export default function AdminLogin() {
  const navigate = useNavigate()
  const { setAdmin } = useAdminAuthStore()

  const [showPassword, setShowPassword] = useState(false)
  const [submitState, setSubmitState] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', rememberDevice: false },
  })

  const onSubmit = async ({ email, password }) => {
    setSubmitState('loading')
    setServerError('')

    try {
      const result = await adminLogin(email, password)

      if (result.success) {
        setSubmitState('success')
        setAdmin(result.admin, result.token)
        // Brief success pause so the animation is visible, then redirect
        setTimeout(() => navigate('/admin/dashboard', { replace: true }), 900)
      } else {
        setSubmitState('error')
        setServerError(result.message || 'Invalid credentials.')
        setTimeout(() => setSubmitState('idle'), 3000)
      }
    } catch {
      setSubmitState('error')
      setServerError('Network error. Please try again.')
      setTimeout(() => setSubmitState('idle'), 3000)
    }
  }

  const isLoading = submitState === 'loading'
  const isSuccess = submitState === 'success'

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-12"
      style={{ background: 'linear-gradient(145deg, #060F1F 0%, #0B1E3D 45%, #152742 75%, #0B1E3D 100%)' }}
    >
      {/* Atmospheric background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Large radial glow top-right */}
        <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #C9A227, transparent 70%)' }} />
        {/* Bottom-left glow */}
        <div className="absolute -bottom-32 -left-32 w-[560px] h-[560px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #C9A227, transparent 65%)' }} />
        {/* Subtle wave lines */}
        <svg className="absolute bottom-0 left-0 w-full opacity-[0.04]" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#C9A227" d="M0,192L60,181.3C120,171,240,149,360,154.7C480,160,600,192,720,197.3C840,203,960,181,1080,165.3C1200,149,1320,139,1380,133.3L1440,128L1440,320L0,320Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full opacity-[0.03]" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#C9A227" d="M0,256L80,240C160,224,320,192,480,186.7C640,181,800,203,960,213.3C1120,224,1280,224,1360,224L1440,224L1440,320L0,320Z" />
        </svg>
        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #C9A227 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ── Login Card ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white rounded-[28px] shadow-[0_24px_80px_rgba(0,0,0,0.45)] px-8 pt-10 pb-8">

          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/crest.png"
              alt="NH Salem Sea Foods Logo"
              className="w-28 h-28 object-contain mb-5"
            />
            <h1 className="font-serif text-3xl font-extrabold text-admin-navy tracking-tight leading-tight">
              NH Salem
            </h1>
            <span className="mt-1 text-[10px] font-bold tracking-[0.22em] uppercase text-admin-text-sub">
              Global Admin Portal
            </span>
            {/* Gold accent line */}
            <div className="mt-3 w-10 h-0.5 rounded-full" style={{ background: '#C9A227' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Institutional Email */}
            <div>
              <label htmlFor="admin-email" className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.12em] mb-1.5">
                Institutional Email
              </label>
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-full border bg-admin-seafoam transition-all duration-150 ${
                errors.email
                  ? 'border-admin-coral ring-2 ring-admin-coral/20'
                  : 'border-admin-border focus-within:border-admin-navy focus-within:ring-2 focus-within:ring-admin-navy/15'
              }`}>
                <span className="material-symbols-outlined text-admin-text-sub flex-shrink-0 leading-none" style={{ fontSize: '18px' }}>
                  alternate_email
                </span>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@nhsalem.com"
                  disabled={isLoading || isSuccess}
                  {...register('email')}
                  className="flex-1 bg-transparent text-sm font-medium text-admin-text placeholder:text-admin-text-sub/50 focus:outline-none disabled:opacity-60"
                />
              </div>
              {errors.email && (
                <p role="alert" className="flex items-center gap-1 mt-1.5 pl-1 text-[12px] font-medium text-admin-coral">
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>error</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Security Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="admin-password" className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.12em]">
                  Security Key
                </label>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-admin-gold hover:text-admin-gold-light transition-colors duration-150 focus:outline-none focus-visible:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-full border bg-admin-seafoam transition-all duration-150 ${
                errors.password
                  ? 'border-admin-coral ring-2 ring-admin-coral/20'
                  : 'border-admin-border focus-within:border-admin-navy focus-within:ring-2 focus-within:ring-admin-navy/15'
              }`}>
                <span className="material-symbols-outlined text-admin-text-sub flex-shrink-0 leading-none" style={{ fontSize: '18px' }}>
                  lock
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={isLoading || isSuccess}
                  {...register('password')}
                  className="flex-1 bg-transparent text-sm font-medium text-admin-text placeholder:text-admin-text-sub/50 focus:outline-none disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide security key' : 'Show security key'}
                  className="text-admin-text-sub hover:text-admin-navy transition-colors duration-150 focus:outline-none flex-shrink-0"
                >
                  <span className="material-symbols-outlined leading-none" style={{ fontSize: '18px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="flex items-center gap-1 mt-1.5 pl-1 text-[12px] font-medium text-admin-coral">
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>error</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember device */}
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                {...register('rememberDevice')}
                disabled={isLoading || isSuccess}
                className="w-4 h-4 rounded border-admin-border cursor-pointer disabled:opacity-60 flex-shrink-0"
                style={{ accentColor: '#0B1E3D' }}
              />
              <span className="text-[12px] font-medium text-admin-text-sub">
                Trust this device for 30 days
              </span>
            </label>

            {/* Server error */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-2 px-4 py-3 rounded-[12px] bg-admin-coral/8 border border-admin-coral/25"
                >
                  <span className="material-symbols-outlined text-admin-coral flex-shrink-0 mt-0.5" style={{ fontSize: '16px' }}>
                    warning
                  </span>
                  <p className="text-[12px] font-medium text-admin-coral leading-snug">{serverError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading || isSuccess}
              whileTap={!isLoading && !isSuccess ? { scale: 0.975 } : {}}
              whileHover={!isLoading && !isSuccess ? { filter: 'brightness(1.1)' } : {}}
              className={`w-full flex items-center justify-center gap-3 py-4 px-8 rounded-full font-bold text-sm tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-gold/60 ${
                isSuccess
                  ? 'text-white'
                  : isLoading
                  ? 'opacity-90 cursor-not-allowed text-white'
                  : 'text-white'
              }`}
              style={{
                background: isSuccess
                  ? 'linear-gradient(135deg, #1B7A45, #238C51)'
                  : 'linear-gradient(135deg, #0B1E3D, #1E3A5F)',
                boxShadow: '0 4px 20px rgba(11,30,61,0.4)',
              }}
            >
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                    Access Granted
                  </motion.span>
                ) : isLoading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating…
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    Log In
                    <span className="w-6 h-6 rounded-full flex items-center justify-center bg-white/15 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

          </form>

          {/* Compliance footer inside card */}
          <div className="mt-7 pt-6 border-t border-admin-border/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="material-symbols-outlined text-admin-gold" style={{ fontSize: '14px' }}>security</span>
              <p className="text-[11px] font-semibold text-admin-text-sub tracking-wide">Encrypted Admin Session</p>
            </div>
            <p className="text-center text-[10px] text-admin-text-sub/60 leading-relaxed">
              This portal is restricted to authorised NH Salem personnel only.
              All activity is monitored, logged, and subject to company policy.
            </p>
          </div>
        </div>

        {/* Below-card links */}
        <div className="flex items-center justify-center gap-5 mt-6">
          {[
            { label: 'Support', href: '/help' },
            { label: 'Privacy Policy', href: '/help' },
            { label: 'Global Status', href: '/help' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[11px] font-medium text-white/35 hover:text-white/60 transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
