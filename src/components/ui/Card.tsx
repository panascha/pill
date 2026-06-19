import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg'
}

const padClasses = { sm: 'p-4', md: 'p-6', lg: 'p-8' }

export function Card({ padding = 'md', className = '', children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`bg-surface rounded-xl border border-surface-border shadow-sm ${padClasses[padding]} ${className}`}
    >
      {children}
    </div>
  )
}
