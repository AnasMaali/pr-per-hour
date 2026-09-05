import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnasMarkdown } from '@/features/chatbot/components/AnasMarkdown'

describe('AnasMarkdown', () => {
  it('renders bold Markdown as a <strong> element, not literal asterisks', () => {
    render(<AnasMarkdown content="**Data Analysis & Business Intelligence**" />)

    const strong = screen.getByText('Data Analysis & Business Intelligence')
    expect(strong.tagName).toBe('STRONG')
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument()
  })

  it('renders italic Markdown as an <em> element', () => {
    render(<AnasMarkdown content="This is *quite* useful." />)

    const em = screen.getByText('quite')
    expect(em.tagName).toBe('EM')
  })

  it('renders an ordered list as <ol>/<li>, not literal "1."', () => {
    render(<AnasMarkdown content={'1. First step\n2. Second step'} />)

    const list = screen.getByRole('list')
    expect(list.tagName).toBe('OL')
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('First step')
    expect(items[1]).toHaveTextContent('Second step')
    expect(screen.queryByText(/^1\./)).not.toBeInTheDocument()
  })

  it('renders an unordered list as <ul>/<li>, not literal "*" bullets', () => {
    render(<AnasMarkdown content={'- Strategic Communication\n- Public Relations'} />)

    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Strategic Communication')
  })

  it('renders an http(s) link as a safe, new-tab anchor', () => {
    render(<AnasMarkdown content="Visit [PR Per Hour](https://prperhour.com) for more." />)

    const link = screen.getByRole('link', { name: 'PR Per Hour' })
    expect(link).toHaveAttribute('href', 'https://prperhour.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('autolinks a bare https URL', () => {
    render(<AnasMarkdown content="More at https://prperhour.com today." />)

    expect(
      screen.getByRole('link', { name: 'https://prperhour.com' }),
    ).toHaveAttribute('href', 'https://prperhour.com')
  })

  it('never renders a javascript: link as a clickable anchor', () => {
    render(<AnasMarkdown content="[click me](javascript:alert(1))" />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('click me')).toBeInTheDocument()
  })

  it('renders a bare email as plain text, not a mailto link', () => {
    render(<AnasMarkdown content="Reach us at info@prperhour.com anytime." />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText(/info@prperhour\.com/)).toBeInTheDocument()
  })

  it('never executes or injects raw HTML from the model', () => {
    render(<AnasMarkdown content='<img src=x onerror="window.__pwned = true">' />)

    expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined()
    expect(document.querySelector('img')).not.toBeInTheDocument()
  })

  it('shows literal HTML tags as escaped text instead of rendering them', () => {
    render(<AnasMarkdown content="<script>alert(1)</script>" />)

    expect(document.querySelector('script')).not.toBeInTheDocument()
  })

  it('renders a giant Markdown heading as a compact bold line, not an <h1>', () => {
    render(<AnasMarkdown content="# Our Services" />)

    expect(document.querySelector('h1')).not.toBeInTheDocument()
    const heading = screen.getByText('Our Services')
    expect(heading.tagName).toBe('P')
    expect(heading).toHaveClass('anas-markdown__heading')
  })

  it('renders inline code as a <code> element', () => {
    render(<AnasMarkdown content="Use the `chatbot` namespace." />)

    const code = screen.getByText('chatbot')
    expect(code.tagName).toBe('CODE')
  })

  it('renders Arabic Markdown content correctly, including bold service names and links', () => {
    render(
      <AnasMarkdown content="أنسب نقطة بداية إلك هي **Data Analysis & Business Intelligence**، وممكن تزور [الموقع](https://prperhour.com) لمزيد من التفاصيل." />,
    )

    expect(screen.getByText('Data Analysis & Business Intelligence').tagName).toBe(
      'STRONG',
    )
    expect(screen.getByRole('link', { name: 'الموقع' })).toHaveAttribute(
      'href',
      'https://prperhour.com',
    )
  })

  it('renders an Arabic numbered list correctly', () => {
    render(<AnasMarkdown content={'1. تحليل البيانات\n2. لوحة المتابعة'} />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('تحليل البيانات')
  })
})
