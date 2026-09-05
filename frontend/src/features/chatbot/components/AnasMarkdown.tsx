import type { AnchorHTMLAttributes, ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

export interface AnasMarkdownProps {
  content: string
}

function isSafeHref(href: string | undefined): href is string {
  return typeof href === 'string' && /^https?:\/\//i.test(href)
}

/**
 * Only http(s) links are ever clickable. remark-gfm autolinks bare emails
 * as `mailto:` — those (and any other scheme) render as plain text instead,
 * matching how Anas has always presented an email address: readable, not
 * a link.
 */
function MarkdownLink({
  href,
  children,
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!isSafeHref(href)) {
    return <>{children}</>
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="anas-markdown__link"
    >
      {children}
    </a>
  )
}

/**
 * The model occasionally reaches for a Markdown heading. A chat bubble has
 * no room for a giant heading, so every level renders as a bold lead line
 * instead — never `dangerouslySetInnerHTML`, never raw HTML from the model.
 */
function MarkdownHeading({ children }: { children?: ReactNode }) {
  return <p className="anas-markdown__heading">{children}</p>
}

/** Images aren't part of Anas's supported formatting; drop them silently. */
function MarkdownImage() {
  return null
}

const components: Components = {
  a: MarkdownLink,
  img: MarkdownImage,
  h1: MarkdownHeading,
  h2: MarkdownHeading,
  h3: MarkdownHeading,
  h4: MarkdownHeading,
  h5: MarkdownHeading,
  h6: MarkdownHeading,
}

/**
 * Renders Anas's replies as safe, editorial-feeling Markdown: paragraphs,
 * bold/italic, lists, safe links, and inline code. react-markdown parses to
 * a React element tree (never raw HTML, never `dangerouslySetInnerHTML`),
 * so nothing the model returns can inject markup or scripts — literal HTML
 * in the source is shown as plain escaped text, not executed.
 */
export function AnasMarkdown({ content }: AnasMarkdownProps) {
  return (
    <div className="anas-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
