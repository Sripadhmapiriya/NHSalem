import { forwardRef } from 'react'

/**
 * Input — pill-shaped sea-foam background input
 * SearchInput — variant with search icon
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon,
    iconPosition = 'left',
    type = 'text',
    className = '',
    id,
    required,
    ...props
  },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-label-md text-on-surface-variant font-semibold"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <span
            className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
            style={{ fontSize: '20px' }}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`
            w-full rounded-full bg-surface-container-low border transition-all duration-150
            text-body-md text-on-surface placeholder:text-outline
            px-5 py-3
            ${icon && iconPosition === 'left' ? 'pl-11' : ''}
            ${icon && iconPosition === 'right' ? 'pr-11' : ''}
            ${error
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
              : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/15'
            }
            outline-none
            ${className}
          `}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span
            className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
            style={{ fontSize: '20px' }}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-label-sm text-error flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">error</span>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-label-sm text-on-surface-variant">
          {hint}
        </p>
      )}
    </div>
  )
})

/**
 * SearchInput — pill search with debounced onChange
 */
export function SearchInput({ placeholder = 'Search…', value, onChange, className = '', id = 'search-input' }) {
  return (
    <div className={`relative ${className}`}>
      <span
        className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
        style={{ fontSize: '20px' }}
        aria-hidden="true"
      >
        search
      </span>
      <input
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="
          w-full rounded-full bg-surface-container-low border border-outline-variant
          pl-11 pr-5 py-3 text-body-md text-on-surface placeholder:text-outline
          focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none
          transition-all duration-150
        "
      />
    </div>
  )
}

export default Input
