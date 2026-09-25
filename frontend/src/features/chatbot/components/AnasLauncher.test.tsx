import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { AnasLauncher } from '@/features/chatbot/components/AnasLauncher'

function renderLauncher(onPreload = vi.fn()) {
  const ref = createRef<HTMLButtonElement>()
  renderWithProviders(
    <AnasLauncher
      ref={ref}
      panelId="panel-id"
      hidden={false}
      unreadCount={0}
      reducedMotion
      onOpen={vi.fn()}
      onPreload={onPreload}
    />,
  )
  return screen.getByRole('button', { name: /PRIA/ })
}

describe('AnasLauncher (preload)', () => {
  it('preloads on pointer enter (hover)', async () => {
    const onPreload = vi.fn()
    const button = renderLauncher(onPreload)

    await userEvent.pointer({ target: button, keys: '[MouseLeft>]' })
    button.dispatchEvent(new Event('pointerenter', { bubbles: true }))

    expect(onPreload).toHaveBeenCalled()
  })

  it('preloads on keyboard focus', () => {
    const onPreload = vi.fn()
    const button = renderLauncher(onPreload)

    button.focus()

    expect(onPreload).toHaveBeenCalled()
  })

  it('preloads on pointer down, before any click fires', () => {
    const onPreload = vi.fn()
    const button = renderLauncher(onPreload)

    button.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(onPreload).toHaveBeenCalled()
  })

  it('preloads on touch start', () => {
    const onPreload = vi.fn()
    const button = renderLauncher(onPreload)

    button.dispatchEvent(new Event('touchstart', { bubbles: true }))

    expect(onPreload).toHaveBeenCalled()
  })

  it('still calls onOpen when clicked', async () => {
    const onOpen = vi.fn()
    const user = userEvent.setup()
    const ref = createRef<HTMLButtonElement>()

    renderWithProviders(
      <AnasLauncher
        ref={ref}
        panelId="panel-id"
        hidden={false}
        unreadCount={0}
        reducedMotion
        onOpen={onOpen}
        onPreload={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /PRIA/ }))

    expect(onOpen).toHaveBeenCalledTimes(1)
  })
})
