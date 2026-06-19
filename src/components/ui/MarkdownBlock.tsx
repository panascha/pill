import { renderMd } from '../../lib/helpers'

interface MarkdownBlockProps {
  content: string | null | undefined
  className?: string
}

export function MarkdownBlock({ content, className = '' }: MarkdownBlockProps) {
  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMd(content) }}
    />
  )
}
