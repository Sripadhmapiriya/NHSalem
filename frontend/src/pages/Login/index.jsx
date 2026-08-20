import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useAuthStore from '@/store/authStore'
import useToastStore from '@/store/toastStore'
import { loginWithEmail, loginWithPhone, registerUser, forgotPassword, resetPassword } from '@/services/api'

// ── Validation schemas ────────────────────────────────────────────────────────

const emailSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const phoneSchema = z.object({
  phone:    z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address (e.g. name@domain.com)'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
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

function EmailForm({ onSuccess, setMode }) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()
  const { addToast } = useToastStore()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
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

  const fillDemo = () => {
    setValue('email', 'user@nhsalem.com')
    setValue('password', 'password123')
  }

  const inputCls = (hasError) =>
    `flex-1 bg-transparent text-sm font-medium text-on-surface placeholder:text-outline/70 focus:outline-none disabled:opacity-60 ${hasError ? 'text-red-700' : ''}`

  const wrapCls = (hasError) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-full border bg-surface-container-low transition-all duration-150 ${
      hasError
        ? 'border-red-400 ring-2 ring-red-400/20'
        : 'border-outline-variant focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'
    }`

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2">
      {/* Email */}
      <div>
        <label htmlFor="email-login-email" className="block text-[11px] font-bold text-on-surface mb-0.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className={wrapCls(!!errors.email)}>
          <span className="material-symbols-outlined text-outline flex-shrink-0 leading-none" style={{ fontSize: '15px' }}>
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
        <div className="flex items-center justify-between mb-0.5">
          <label htmlFor="email-login-password" className="text-[11px] font-bold text-on-surface">
            Password <span className="text-red-500">*</span>
          </label>
          <button type="button" onClick={() => setMode('forgot_password')} className="text-[10px] text-primary hover:underline font-semibold">
            Forgot?
          </button>
        </div>
        <div className={wrapCls(!!errors.password)}>
          <span className="material-symbols-outlined text-outline flex-shrink-0 leading-none" style={{ fontSize: '16px' }}>
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
            <span className="material-symbols-outlined leading-none" style={{ fontSize: '16px' }}>
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
            className="flex items-start gap-2.5 px-3 py-2 rounded-[12px] bg-red-50 border border-red-200"
          >
            <span className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5" style={{ fontSize: '14px' }}>warning</span>
            <p className="text-[11px] font-medium text-red-700 leading-snug">{serverError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-full font-bold text-sm text-white tracking-wide transition-all duration-200 bg-primary hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ boxShadow: '0 2px 10px rgba(0,5,22,0.2)' }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            Sign In with Email
            <span className="material-symbols-outlined leading-none" style={{ fontSize: '14px' }}>arrow_forward</span>
          </>
        )}
      </button>

      {/* Demo Credentials */}
      <div className="flex justify-center mt-3">
        <button
          type="button"
          onClick={() => fillDemo()}
          className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-full transition-colors flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">person</span>
          Demo User
        </button>
      </div>
    </form>
  )
}

// ── Phone + Password form ─────────────────────────────────────────────────────
function PhoneForm({ onSuccess, setMode }) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()
  const { addToast } = useToastStore()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
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

  const fillDemo = () => {
    setValue('phone', '9876543210')
    setValue('password', 'password123')
  }

  const inputCls = (hasError) =>
    `flex-1 bg-transparent text-sm font-medium text-on-surface placeholder:text-outline/70 focus:outline-none disabled:opacity-60 ${hasError ? 'text-red-700' : ''}`

  const wrapCls = (hasError) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-full border bg-surface-container-low transition-all duration-150 ${
      hasError
        ? 'border-red-400 ring-2 ring-red-400/20'
        : 'border-outline-variant focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'
    }`

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2">
      {/* Phone */}
      <div>
        <label htmlFor="phone-login-phone" className="block text-[11px] font-bold text-on-surface mb-0.5">
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <div className={wrapCls(!!errors.phone)}>
          <span className="flex items-center px-1.5 border-r border-outline-variant text-xs text-on-surface-variant flex-shrink-0 mr-1 leading-none">
            +91
          </span>
          <input
            id="phone-login-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit mobile"
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
        <div className="flex items-center justify-between mb-0.5">
          <label htmlFor="phone-login-password" className="text-[11px] font-bold text-on-surface">
            Password <span className="text-red-500">*</span>
          </label>
          <button type="button" onClick={() => setMode('forgot_password')} className="text-[10px] text-primary hover:underline font-semibold">
            Forgot?
          </button>
        </div>
        <div className={wrapCls(!!errors.password)}>
          <span className="material-symbols-outlined text-outline flex-shrink-0 leading-none" style={{ fontSize: '16px' }}>
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
            <span className="material-symbols-outlined leading-none" style={{ fontSize: '16px' }}>
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
            className="flex items-start gap-2.5 px-3 py-2 rounded-[12px] bg-red-50 border border-red-200"
          >
            <span className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5" style={{ fontSize: '14px' }}>warning</span>
            <p className="text-[11px] font-medium text-red-700 leading-snug">{serverError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-full font-bold text-sm text-white tracking-wide transition-all duration-200 bg-primary hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ boxShadow: '0 2px 10px rgba(0,5,22,0.2)' }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            Sign In with Phone
            <span className="material-symbols-outlined leading-none" style={{ fontSize: '14px' }}>arrow_forward</span>
          </>
        )}
      </button>

      {/* Demo Credentials */}
      <div className="flex justify-center mt-3">
        <button
          type="button"
          onClick={() => fillDemo()}
          className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-full transition-colors flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">person</span>
          Demo User (Phone)
        </button>
      </div>
    </form>
  )
}

// ── Register form ─────────────────────────────────────────────────────────────

function RegisterForm({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()
  const { addToast } = useToastStore()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' }
  })

  const onSubmit = async (values) => {
    setLoading(true)
    setServerError('')
    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password
    }
    const result = await registerUser(payload)
    setLoading(false)
    if (result.success) {
      setUser(result.user, result.token)
      addToast({ message: `Welcome, ${result.user.name}! Account created successfully. 🎉`, type: 'success' })
      onSuccess?.()
    } else {
      setServerError(result.message)
    }
  }

  const inputCls = (hasError) =>
    `flex-1 bg-transparent text-sm font-medium text-on-surface placeholder:text-outline/70 focus:outline-none disabled:opacity-60 ${hasError ? 'text-red-700' : ''}`

  const wrapCls = (hasError) =>
    `flex items-center gap-2 px-3 h-10 rounded-full border bg-surface-container-low transition-all duration-150 ${
      hasError
        ? 'border-red-400 ring-2 ring-red-400/20'
        : 'border-outline-variant focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'
    }`

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2">
      {/* Full Name */}
      <div>
        <label htmlFor="reg-name" className="block text-[11px] font-bold text-on-surface mb-0.5">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className={wrapCls(!!errors.name)}>
          <span className="material-symbols-outlined text-outline flex-shrink-0 leading-none" style={{ fontSize: '16px' }}>
            person
          </span>
          <input
            id="reg-name"
            type="text"
            placeholder="John Doe"
            disabled={loading}
            {...register('name')}
            className={inputCls(!!errors.name)}
          />
        </div>
        <FieldError message={errors.name?.message} />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="reg-email" className="block text-[11px] font-bold text-on-surface mb-0.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className={wrapCls(!!errors.email)}>
          <span className="material-symbols-outlined text-outline flex-shrink-0 leading-none" style={{ fontSize: '16px' }}>
            alternate_email
          </span>
          <input
            id="reg-email"
            type="email"
            placeholder="name@example.com"
            disabled={loading}
            {...register('email')}
            className={inputCls(!!errors.email)}
          />
        </div>
        <FieldError message={errors.email?.message} />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="reg-phone" className="block text-[11px] font-bold text-on-surface mb-0.5">
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <div className={wrapCls(!!errors.phone)}>
          <span className="flex items-center px-2 border-r border-outline-variant text-sm text-on-surface-variant flex-shrink-0 mr-1 leading-none">
            +91
          </span>
          <input
            id="reg-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit mobile number"
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

      {/* Password fields row */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        {/* Password */}
        <div className="flex-1 min-w-0">
          <label htmlFor="reg-password" className="block text-[11px] font-bold text-on-surface mb-1 truncate">
            Password <span className="text-red-500">*</span>
          </label>
          <div className={wrapCls(!!errors.password)}>
            <span className="material-symbols-outlined text-outline flex-shrink-0 leading-none" style={{ fontSize: '15px' }}>
              lock
            </span>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={loading}
              {...register('password')}
              className={inputCls(!!errors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-outline hover:text-on-surface transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined leading-none" style={{ fontSize: '15px' }}>
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        {/* Confirm Password */}
        <div className="flex-1 min-w-0">
          <label htmlFor="reg-confirm-password" className="block text-[11px] font-bold text-on-surface mb-1 truncate">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className={wrapCls(!!errors.confirmPassword)}>
            <span className="material-symbols-outlined text-outline flex-shrink-0 leading-none" style={{ fontSize: '15px' }}>
              lock_reset
            </span>
            <input
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={loading}
              {...register('confirmPassword')}
              className={inputCls(!!errors.confirmPassword)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="text-outline hover:text-on-surface transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined leading-none" style={{ fontSize: '15px' }}>
                {showConfirmPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          <FieldError message={errors.confirmPassword?.message} />
        </div>
      </div>

      {/* Server Error */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2.5 px-3 py-2 rounded-[12px] bg-red-50 border border-red-200"
          >
            <span className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5" style={{ fontSize: '14px' }}>warning</span>
            <p className="text-[11px] font-medium text-red-700 leading-snug">{serverError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-full font-bold text-sm text-white tracking-wide transition-all duration-200 bg-primary hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ boxShadow: '0 2px 10px rgba(0,5,22,0.2)' }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating account…
          </>
        ) : (
          <>
            Register & Sign In
            <span className="material-symbols-outlined leading-none" style={{ fontSize: '14px' }}>arrow_forward</span>
          </>
        )}
      </button>
    </form>
  )
}

// ── Forgot Password Form ──────────────────────────────────────────────────────

function ForgotPasswordForm({ setMode }) {
  const [step, setStep] = useState(1) // 1: request otp, 2: verify otp & reset
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [serverSuccess, setServerSuccess] = useState('')
  const { addToast } = useToastStore()
  
  // Step 1 values
  const [email, setEmail] = useState('')
  
  // Step 2 values
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (!email) return setServerError('Email is required')
    
    setLoading(true)
    setServerError('')
    const result = await forgotPassword(email)
    setLoading(false)
    
    if (result.success) {
      setServerSuccess('Reset code sent! Please check your email inbox.')
      setStep(2)
    } else {
      setServerError(result.message)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!otp || !newPassword) return setServerError('OTP and new password are required')
    if (newPassword.length < 8) return setServerError('Password must be at least 8 characters')
    
    setLoading(true)
    setServerError('')
    const result = await resetPassword(email, otp, newPassword)
    setLoading(false)
    
    if (result.success) {
      addToast({ message: 'Password reset successful! You can now log in.', type: 'success' })
      setMode('login')
    } else {
      setServerError(result.message)
    }
  }

  const inputCls = (hasError) =>
    `flex-1 bg-transparent text-sm font-medium text-on-surface placeholder:text-outline/70 focus:outline-none disabled:opacity-60 ${hasError ? 'text-red-700' : ''}`

  const wrapCls = (hasError) =>
    `flex items-center gap-2 px-3 py-2 rounded-full border bg-surface-container-low transition-all duration-150 ${
      hasError
        ? 'border-red-400 ring-2 ring-red-400/20'
        : 'border-outline-variant focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'
    }`

  return (
    <div className="space-y-4">
      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-on-surface mb-0.5">
              Email Address
            </label>
            <div className={wrapCls(false)}>
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '15px' }}>alternate_email</span>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                disabled={loading}
                className={inputCls(false)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 rounded-full font-bold text-sm text-white bg-primary hover:bg-primary/90 disabled:opacity-70"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-on-surface mb-0.5">
              6-Digit Verification Code
            </label>
            <div className={wrapCls(false)}>
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '15px' }}>pin</span>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="123456"
                disabled={loading}
                className={inputCls(false)}
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-on-surface mb-0.5">
              New Password
            </label>
            <div className={wrapCls(false)}>
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '15px' }}>lock</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New strong password"
                disabled={loading}
                className={inputCls(false)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 rounded-full font-bold text-sm text-white bg-primary hover:bg-primary/90 disabled:opacity-70"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {/* Messages */}
      <AnimatePresence>
        {serverError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2.5 px-3 py-2 rounded-[12px] bg-red-50 border border-red-200">
            <span className="material-symbols-outlined text-red-500" style={{ fontSize: '14px' }}>warning</span>
            <p className="text-[11px] font-medium text-red-700">{serverError}</p>
          </motion.div>
        )}
        {serverSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2.5 px-3 py-2 rounded-[12px] bg-green-50 border border-green-200">
            <span className="material-symbols-outlined text-green-500" style={{ fontSize: '14px' }}>check_circle</span>
            <p className="text-[11px] font-medium text-green-700">{serverSuccess}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => setMode('login')}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
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
export default function LoginPage({ isModal = false, initialMode = 'login', onSuccess }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('email') // 'email' | 'phone'
  const [mode, setMode] = useState(initialMode) // 'login' | 'register'

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    } else {
      const from = location.state?.from || '/'
      navigate(from, { replace: true })
    }
  }

  const content = (
    <div className="px-2 py-0.5">
      {/* Redesigned Header Row: Logo next to Title */}
      <div className="flex items-center justify-center gap-2 mb-1.5 mt-0 select-none">
        <img
          src="/crest.png"
          alt="NH Salem Sea Foods Logo"
          className="w-8 h-8 object-contain"
        />
        <h2 className="text-base font-extrabold text-gray-900 leading-none">
          {mode === 'forgot_password' ? 'Reset Password' : 'Welcome to NH Salem'}
        </h2>
      </div>
      <p className="text-[11px] text-center text-gray-500 mb-1.5">
        {mode === 'login' ? 'Sign in to continue' : mode === 'register' ? 'Create an account to continue' : 'We will send you a reset link'}
      </p>

      {/* Tab switcher */}
      {mode === 'login' && (
        <div className="flex bg-gray-100 rounded-full p-0.5 mb-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all ${
              activeTab === 'email' ? 'bg-primary text-white font-bold' : 'text-gray-500'
            }`}
          >
            @ Email
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('phone')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all ${
              activeTab === 'phone' ? 'bg-primary text-white font-bold' : 'text-gray-500'
            }`}
          >
            📞 Phone
          </button>
        </div>
      )}

      {/* Animated form panels */}
      <div className="mb-2">
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            activeTab === 'email' ? (
              <motion.div
                key="email-login-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <EmailForm onSuccess={handleSuccess} setMode={setMode} />
              </motion.div>
            ) : (
              <motion.div
                key="phone-login-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <PhoneForm onSuccess={handleSuccess} setMode={setMode} />
              </motion.div>
            )
          ) : mode === 'register' ? (
            <motion.div
              key="register-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <RegisterForm onSuccess={handleSuccess} />
            </motion.div>
          ) : (
            <motion.div
              key="forgot-password-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <ForgotPasswordForm setMode={setMode} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle link */}
      <div className="text-center mt-2">
        {mode === 'login' ? (
          <button
            type="button"
            onClick={() => setMode('register')}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Don't have an account? Sign Up
          </button>
        ) : mode === 'register' ? (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Already have an account? Sign In
          </button>
        ) : null}
      </div>
      {/* Footer links */}
      <p className="text-[10px] text-on-surface-variant text-center mt-1">
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
