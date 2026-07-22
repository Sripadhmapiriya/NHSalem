import React from 'react'

/**
 * Enterprise Card Component
 * Shared, standardized card layout for features, commitments, and value props.
 */
export default function Card({ 
  icon, 
  title, 
  desc, 
  variant = 'light', // 'light' | 'dark'
  className = '' 
}) {
  const isDark = variant === 'dark'

  return (
    <div 
      className={`
        rounded-2xl p-6 transition-all duration-300 flex flex-col items-start
        ${isDark 
          ? 'bg-white/5 border border-white/10 hover:border-[#fed255]/40 hover:bg-white/[0.07]' 
          : 'bg-surface border border-outline-variant shadow-sm hover:shadow-card hover:border-[#000516]/20'
        }
        ${className}
      `}
    >
      <div 
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center mb-5 shrink-0 transition-transform duration-300 group-hover:scale-105
          ${isDark ? 'bg-[#fed255]/10 text-[#fed255]' : 'bg-[#000516]/5 text-[#000516]'}
        `}
      >
        <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
          {icon}
        </span>
      </div>

      <h3 className={`text-headline-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-on-surface'}`}>
        {title}
      </h3>

      <p className={`text-body-md leading-relaxed ${isDark ? 'text-white/70' : 'text-on-surface-variant'}`}>
        {desc}
      </p>
    </div>
  )
}
