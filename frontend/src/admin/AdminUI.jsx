/**
 * Admin shared UI primitives
 * All components use only the admin-* Tailwind tokens from tailwind.config.js
 */

// ── Status Badge ───────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  // Orders
  confirmed:        'bg-blue-50 text-blue-700 border-blue-200',
  packed:           'bg-yellow-50 text-yellow-700 border-yellow-200',
  out_for_delivery: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered:        'bg-green-50 text-green-700 border-green-200',
  cancelled:        'bg-red-50 text-red-600 border-red-200',
  // Subscriptions
  active:           'bg-green-50 text-green-700 border-green-200',
  paused:           'bg-yellow-50 text-yellow-700 border-yellow-200',
  // Promotions
  scheduled:        'bg-blue-50 text-blue-700 border-blue-200',
  // Reviews
  published:        'bg-green-50 text-green-700 border-green-200',
  pending:          'bg-yellow-50 text-yellow-700 border-yellow-200',
  flagged:          'bg-red-50 text-red-600 border-red-200',
  // Wholesale
  new:              'bg-blue-50 text-blue-700 border-blue-200',
  contacted:        'bg-yellow-50 text-yellow-700 border-yellow-200',
  negotiating:      'bg-purple-50 text-purple-700 border-purple-200',
  converted:        'bg-green-50 text-green-700 border-green-200',
  closed:           'bg-gray-100 text-gray-500 border-gray-200',
  // Customers
  inactive:         'bg-gray-100 text-gray-500 border-gray-200',
  refunded:         'bg-orange-50 text-orange-600 border-orange-200',
  paid:             'bg-green-50 text-green-700 border-green-200',
  collected:        'bg-green-50 text-green-700 border-green-200',
  guest:            'bg-purple-50 text-purple-700 border-purple-200',
}

const STATUS_LABELS = {
  out_for_delivery: 'Out for Delivery',
  confirmed:        'Confirmed',
  packed:           'Packed',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
  active:           'Active',
  paused:           'Paused',
  scheduled:        'Scheduled',
  published:        'Published',
  pending:          'Pending',
  flagged:          'Flagged',
  new:              'New',
  contacted:        'Contacted',
  negotiating:      'Negotiating',
  converted:        'Converted',
  closed:           'Closed',
  inactive:         'Inactive',
  refunded:         'Refunded',
  paid:             'Paid',
  collected:        'Collected',
  guest:            'Guest',
}

export function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500 border-gray-200'
  const label = STATUS_LABELS[status] ?? status
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cls}`}>
      {label}
    </span>
  )
}

// ── KPI Card ───────────────────────────────────────────────────────────────────
export function KpiCard({ title, value, sub, icon, iconColor = 'text-admin-navy', trend }) {
  const isPositive = trend?.startsWith('+')
  return (
    <div className="bg-white rounded-[16px] border border-admin-border/60 p-5 shadow-[0_2px_12px_rgba(11,30,61,0.06)]">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-bold text-admin-text-sub uppercase tracking-[0.1em]">{title}</p>
        <span className={`material-symbols-outlined ${iconColor}`} style={{ fontSize: '20px' }}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-admin-navy leading-none mb-1">{value}</p>
      {(sub || trend) && (
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span className={`text-[11px] font-bold ${isPositive ? 'text-admin-success' : 'text-admin-coral'}`}>
              {trend}
            </span>
          )}
          {sub && <span className="text-[11px] text-admin-text-sub">{sub}</span>}
        </div>
      )}
    </div>
  )
}

// ── Page Shell ─────────────────────────────────────────────────────────────────
// action: right-aligned primary/secondary CTAs
// back:   left-aligned Back navigation button (sits far-left, separated from actions)
export function AdminPage({ children, action, back }) {
  const hasBar = action || back
  return (
    <div className="p-5 md:p-7 min-h-full">
      {hasBar && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {/* Back sits on the left */}
          <div>{back ?? <span />}</div>
          {/* Primary actions sit on the right */}
          <div className="flex items-center gap-2">{action}</div>
        </div>
      )}
      {children}
    </div>
  )
}

// ── Section Card ───────────────────────────────────────────────────────────────
export function AdminCard({ title, subtitle, children, className = '', action }) {
  return (
    <div className={`bg-white rounded-[16px] border border-admin-border/60 shadow-[0_2px_12px_rgba(11,30,61,0.06)] overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-admin-border/40">
          <div>
            {title && <h2 className="text-[14px] font-bold text-admin-navy">{title}</h2>}
            {subtitle && <p className="text-[11px] text-admin-text-sub mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

// ── Table ──────────────────────────────────────────────────────────────────────
export function AdminTable({ headers, children, emptyMessage = 'No data available.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-admin-border/40">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left px-5 py-3 text-[10px] font-bold text-admin-text-sub uppercase tracking-[0.1em] whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children || (
            <tr>
              <td colSpan={headers.length} className="text-center px-5 py-10 text-sm text-admin-text-sub">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function Tr({ onClick, children, className = '' }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-admin-border/20 last:border-0 transition-colors duration-100 ${onClick ? 'cursor-pointer hover:bg-admin-seafoam/70' : ''} ${className}`}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-5 py-3.5 text-[13px] text-admin-text ${className}`}>
      {children}
    </td>
  )
}

// ── Pill Button ────────────────────────────────────────────────────────────────
export function AdminBtn({ children, variant = 'primary', onClick, type = 'button', icon, size = 'md', disabled = false, className = '' }) {
  // Use inline style for base colors to guarantee they never get stripped/purged by JIT
  const styles = {
    primary:   { backgroundColor: '#0B1E3D', color: '#ffffff', borderColor: '#0B1E3D' },
    secondary: { backgroundColor: '#ffffff', color: '#0B1E3D', borderColor: '#D1DAE3' },
    danger:    { backgroundColor: '#C1442D', color: '#ffffff', borderColor: '#C1442D' },
    gold:      { backgroundColor: '#C9A227', color: '#ffffff', borderColor: '#C9A227' },
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-[12px]',
    md: 'px-4 py-2 text-[13px]',
    lg: 'px-6 py-2.5 text-[14px]',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={styles[variant]}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy/30 ${sizes[size]} ${className}`}
    >
      {icon && <span className="material-symbols-outlined leading-none" style={{ fontSize: '15px' }}>{icon}</span>}
      {children}
    </button>
  )
}

// ── Text input ─────────────────────────────────────────────────────────────────
export function AdminInput({ label, id, type = 'text', placeholder, value, onChange, icon, className = '' }) {
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">{label}</label>}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam focus-within:border-admin-navy focus-within:ring-2 focus-within:ring-admin-navy/10 transition-all">
        {icon && <span className="material-symbols-outlined text-admin-text-sub flex-shrink-0" style={{ fontSize: '16px' }}>{icon}</span>}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="flex-1 bg-transparent text-[13px] text-admin-text placeholder:text-admin-text-sub/50 focus:outline-none"
        />
      </div>
    </div>
  )
}

// ── Avatar initial circle ──────────────────────────────────────────────────────
export function Avatar({ name, size = 'sm' }) {
  const sizes = { sm: 'w-7 h-7 text-[11px]', md: 'w-9 h-9 text-[13px]' }
  const colors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700']
  const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${sizes[size]} ${color}`}>
      {name?.charAt(0)?.toUpperCase() ?? '?'}
    </div>
  )
}

export function formatCurrency(n) {
  return `₹${n?.toLocaleString('en-IN') ?? '0'}`
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Filter Pill ────────────────────────────────────────────────────────────────
// Use inline style for active bg/color so Tailwind JIT never strips them in
// dynamic template literals. This is the single source-of-truth for every
// filter bar across the admin panel.
export function FilterPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={
        active
          ? { backgroundColor: '#0B1E3D', color: '#ffffff', borderColor: '#0B1E3D' }
          : {}
      }
      className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-150 capitalize whitespace-nowrap
        ${active
          ? 'border-transparent'
          : 'bg-white text-admin-text-sub border-admin-border hover:border-admin-navy/50 hover:text-admin-navy'
        }`}
    >
      {label}
    </button>
  )
}

// ── Filter Bar ─────────────────────────────────────────────────────────────────
// Renders a row of FilterPill buttons from an options array.
// options: [{ value, label }] or [string]  (strings used as both value + label)
// active:  the currently selected value
// onSelect: (value) => void
export function FilterBar({ options, active, onSelect, className = '' }) {
  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? (value === 'all' ? 'All' : value.replace(/_/g, ' ')) : opt.label
        return (
          <FilterPill
            key={value}
            label={label}
            active={active === value}
            onClick={() => onSelect(value)}
          />
        )
      })}
    </div>
  )
}
