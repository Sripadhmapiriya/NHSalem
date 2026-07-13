/**
 * Card — Level 1 elevation card (white, shadow, 28px radius)
 */
export default function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div
      className={`bg-white rounded-[28px] shadow-card ${padding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
