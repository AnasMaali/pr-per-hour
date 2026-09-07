/**
 * Defense-in-depth for the brief window while a message is still
 * streaming: trims back to the last point where Markdown is structurally
 * balanced, so a visitor never sees a literal dangling "**" or a broken
 * "[text](" link fragment.
 *
 * The backend's SafeStreamChunker already guarantees the cumulative raw
 * text is Markdown-balanced at every chunk boundary it emits — this
 * mirrors that same check client-side as a backstop, not the primary
 * safety mechanism. It is only ever applied to a message with
 * status "streaming"; the final "done" text is already guard-validated
 * and shown as-is.
 */
export function getStreamSafeMarkdown(text: string): string {
  if (isBalanced(text)) {
    return text
  }

  // Back off one word at a time (never mid-word) until balanced again.
  let cut = text.length

  while (cut > 0) {
    const lastSpace = text.lastIndexOf(' ', cut - 1)

    if (lastSpace <= 0) {
      break
    }

    cut = lastSpace
    const candidate = text.slice(0, cut)

    if (isBalanced(candidate)) {
      return candidate
    }
  }

  // Nothing safe to back off to — show it as-is rather than blanking the
  // message outright; this is a rare, transient state that self-heals on
  // the next delta or the final "done" replace.
  return text
}

function isBalanced(text: string): boolean {
  const boldCount = (text.match(/\*\*/g) ?? []).length

  if (boldCount % 2 !== 0) {
    return false
  }

  const lastOpenBracket = text.lastIndexOf('[')

  if (lastOpenBracket === -1) {
    return true
  }

  const tail = text.slice(lastOpenBracket)

  return /^\[[^[\]]*\]\([^()\s]+\)/.test(tail)
}
