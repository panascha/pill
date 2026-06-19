import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  title?: string
  subtitle?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
}

export function PageShell({ children, title, subtitle, maxWidth = 'lg' }: PageShellProps) {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] py-8 px-4">
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        {(title || subtitle) && (
          <div className="mb-8">
            {title && <h1 className="text-2xl font-semibold text-ink">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </main>
  )
}
