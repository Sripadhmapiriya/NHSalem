import { useRef, useEffect } from 'react'

/**
 * OTPInput — 6-box auto-advancing input
 * - Auto-advance on digit entry
 * - Backspace moves to previous
 * - Paste fills all boxes
 * - onChange(value) called with full OTP string
 */
export default function OTPInput({ length = 6, value = '', onChange, disabled = false, error }) {
  const inputsRef = useRef([])

  const digits = Array.from({ length }, (_, i) => value[i] || '')

  const focusAt = (i) => inputsRef.current[i]?.focus()

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    if (!val) return
    const newDigits = [...digits]
    newDigits[index] = val
    onChange(newDigits.join(''))
    if (index < length - 1) focusAt(index + 1)
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits]
        newDigits[index] = ''
        onChange(newDigits.join(''))
      } else if (index > 0) {
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        onChange(newDigits.join(''))
        focusAt(index - 1)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusAt(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusAt(index + 1)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      onChange(pasted.padEnd(length, '').slice(0, length))
      focusAt(Math.min(pasted.length, length - 1))
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex gap-3 justify-center"
        role="group"
        aria-label="One-time password input"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`OTP digit ${i + 1} of ${length}`}
            aria-invalid={!!error}
            className={`
              w-12 h-14 text-center text-headline-md font-bold rounded-[16px] border-2
              bg-surface-container-low text-on-surface
              transition-all duration-150 outline-none caret-transparent
              ${digit ? 'border-primary bg-primary/5' : 'border-outline-variant'}
              ${error ? 'border-error' : ''}
              focus:border-primary focus:ring-2 focus:ring-primary/20
              disabled:opacity-50
            `}
          />
        ))}
      </div>
      {error && (
        <p className="text-label-sm text-error text-center flex items-center justify-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
