/**
 * Badge — status/label badges with uniform dark frosted glass treatment
 * Background: Deep Navy at 38% opacity, blur-md (12px), defined white border (25%)
 * Colors are represented strictly in the icon.
 */
export default function Badge({
  children,
  variant = 'glass',
  tone,
  className = '',
}) {
  // Map old variant parameters to new glass tones
  let activeTone = tone
  if (!activeTone) {
    if (['fresh', 'hot', 'limited', 'premium', 'new', 'deal'].includes(variant)) {
      activeTone = variant
    }
  }

  // Normalize tone names
  if (activeTone === 'hot') activeTone = 'deal'
  if (!activeTone) activeTone = 'fresh'

  const tones = {
    fresh: {
      icon: 'eco',
      iconColor: 'text-[#4ADE80]',
      defaultLabel: 'Fresh',
    },
    premium: {
      icon: 'star',
      iconColor: 'text-[#FBBF24]',
      defaultLabel: 'Premium',
    },
    deal: {
      icon: 'bolt',
      iconColor: 'text-[#FB7185]',
      defaultLabel: 'Deal',
    },
    limited: {
      icon: 'schedule',
      iconColor: 'text-[#60A5FA]',
      defaultLabel: 'Limited',
    },
    new: {
      icon: 'auto_awesome',
      iconColor: 'text-[#A78BFA]',
      defaultLabel: 'New',
    },
  }

  const config = tones[activeTone] || tones.fresh

  // Normalize and shorten labels to sentence case
  let content = children
  if (typeof children === 'string') {
    const lower = children.toLowerCase().trim()
    if (lower === 'fresh today' || lower === 'fresh') content = 'Fresh'
    else if (lower === 'premium') content = 'Premium'
    else if (lower === 'hot deal' || lower === 'deal') content = 'Deal'
    else if (lower === 'limited time' || lower === 'limited') content = 'Limited'
    else if (lower === 'new catch' || lower === 'new') content = 'New'
    else content = children
  }

  if (!content) {
    content = config.defaultLabel
  }

  if (variant === 'outline') {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-label-sm font-semibold border border-outline-variant bg-transparent text-on-surface ${className}`}
      >
        {content}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-[5px] rounded-full text-[12px] font-medium bg-[#0b1e3d]/38 backdrop-blur-md border border-white/25 text-white select-none ${className}`}
      style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.25)',
      }}
    >
      {config.icon && (
        <span className={`material-symbols-outlined text-[14px] leading-none filled ${config.iconColor}`} aria-hidden="true">
          {config.icon}
        </span>
      )}
      <span>{content}</span>
    </span>
  )
}
