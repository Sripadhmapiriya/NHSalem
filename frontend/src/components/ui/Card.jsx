import React from 'react'

/**
 * Enterprise Card Component
 * Clean, consistent card for features, commitments, and value props on a light canvas.
 */
export default function Card({ 
  icon, 
  title, 
  desc,
  highlighted = false, 
  className = '' 
}) {
  if (highlighted) {
    return (
      <div 
        className={`
          bg-[#000516] text-white border border-[#000516] rounded-2xl p-6 transition-all duration-300 flex flex-col items-start shadow-md hover:shadow-xl hover:-translate-y-1.5 group
          ${className}
        `}
      >
        <div className="w-12 h-12 rounded-xl bg-white/10 text-[#fed255] border border-white/20 flex items-center justify-center mb-5 shrink-0 group-hover:bg-[#fed255] group-hover:text-[#000516] transition-all duration-300 shadow-sm">
          <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
            {icon}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 leading-snug">
          {title}
        </h3>

        <p className="text-sm text-slate-300 leading-relaxed">
          {desc}
        </p>
      </div>
    )
  }

  return (
    <div 
      className={`
        bg-white border border-slate-200/80 rounded-2xl p-6 transition-all duration-300 flex flex-col items-start shadow-sm hover:shadow-lg hover:-translate-y-1.5 hover:border-[#000516]/25 group
        ${className}
      `}
    >
      <div className="w-12 h-12 rounded-xl bg-[#eef2ff] text-[#000516] border border-[#dbeafe] flex items-center justify-center mb-5 shrink-0 group-hover:bg-[#000516] group-hover:text-white transition-all duration-300 shadow-sm">
        <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
          {icon}
        </span>
      </div>

      <h3 className="text-lg font-bold text-[#000516] mb-2 leading-snug">
        {title}
      </h3>

      <p className="text-sm text-slate-600 leading-relaxed">
        {desc}
      </p>
    </div>
  )
}

