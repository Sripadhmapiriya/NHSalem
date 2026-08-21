/**
 * Badge — unified status/label badges with glassmorphism treatment
 */
export default function Badge({
  children,
  variant = 'glass',
  tone,
  className = '',
}) {
  let activeTone = tone
  if (!activeTone) {
    if (['fresh', 'hot', 'deal', 'limited', 'premium', 'new'].includes(variant)) {
      activeTone = variant
    }
  }

  // Normalize tone names
  if (activeTone === 'hot') activeTone = 'deal'
  if (!activeTone) activeTone = 'default'

  const tones = {
    fresh: {
      icon: 'eco',
      bgClass: 'bg-[rgba(16,185,129,0.25)]',
      defaultLabel: 'FRESH TODAY',
    },
    deal: {
      icon: 'bolt',
      bgClass: 'bg-[rgba(245,158,11,0.25)]',
      defaultLabel: 'HOT DEAL',
    },
    limited: {
      icon: 'schedule', // or 'lens' as in ProductCard
      bgClass: 'bg-[rgba(59,130,246,0.25)]',
      defaultLabel: 'LIMITED TIME',
    },
    premium: {
      icon: 'star',
      bgClass: 'bg-[rgba(234,179,8,0.25)]', // Yellow/Gold tint
      defaultLabel: 'PREMIUM',
    },
    new: {
      icon: 'auto_awesome',
      bgClass: 'bg-[rgba(168,85,247,0.25)]',
      defaultLabel: 'NEW CATCH',
    },
    default: {
      icon: 'sell',
      bgClass: 'bg-[rgba(255,255,255,0.15)]',
      defaultLabel: '',
    },
  }

  const config = tones[activeTone] || tones.default

  let content = children
  if (!content) {
    content = config.defaultLabel
  }

  // Handle outline variant (fallback/legacy support)
  if (variant === 'outline') {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-lg text-label-sm font-semibold border border-outline-variant bg-transparent text-on-surface uppercase tracking-wide ${className}`}
      >
        {content}
      </span>
    )
  }

  // Glassmorphism styling (primary unified design)
  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase text-white backdrop-blur-[10px] border border-[rgba(255,255,255,0.25)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] [text-shadow:0_1px_2px_rgba(0,0,0,0.8)] select-none ${config.bgClass} ${className}`}
    >
      {config.icon && (
        <span className="material-symbols-outlined text-[12px]" aria-hidden="true">
          {config.icon}
        </span>
      )}
      <span>{content}</span>
    </div>
  )
}
